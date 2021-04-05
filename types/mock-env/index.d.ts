declare module "mock-env" {
    function morph<T>(
        callback: () => T,
        vars: Record<string, unknown>,
        toRemove?: string[]
    ): T;
}
