import * as lambda from "https://deno.land/x/denops_std@v5.0.1/lambda/mod.ts";
import { Denops } from "https://deno.land/x/denops_std@v5.0.1/mod.ts";
import { ensure, is } from "https://deno.land/x/unknownutil@v3.4.0/mod.ts";

export type InputOptions = {
  /*
   * The prompt text.
   * Default: ""
   */
  prompt?: string;

  /*
   * The default text.
   * Default: ""
   */
  text?: string;
};

/*
 * Open a prompt to get user input.
 *
 * It is wrapper funciton of Neovim's `vim.ui.input`.
 *
 * @param denops - Denops object
 * @param options - Options
 * @returns The user input, or null if the user canceled the input.
 */
export function input(
  denops: Denops,
  options?: InputOptions,
): Promise<string | null> {
  return new Promise((resolve) => {
    const id = lambda.register(denops, (result: unknown) => {
      resolve(ensure(result, is.OneOf([is.Nullish, is.String])) ?? null);
    }, { once: true });
    denops.call(
      "luaeval",
      `vim.ui.input(
          _A,
          function(input)
            vim.fn['denops#notify']('${denops.name}', '${id}', { input })
          end)`,
      {
        prompt: options?.prompt ?? "",
        default: options?.text ?? "",
      },
    );
  });
}
