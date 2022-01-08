declare module "fast-toml" {
    export function parse<R extends Record<string, unknown>>(input: string): R;
    export function parseFile<R extends Record<string, unknown>>(
        file: string
    ): Promise<R>;
    export function parseFileSync<R extends Record<string, unknown>>(
        file: string
    ): R;
}
