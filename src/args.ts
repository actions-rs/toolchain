import { input } from "@actions-rs/core";
import { parseToolchainFile } from "./toolchain_file";

export interface ToolchainOptions {
    name: string;
    target?: string | undefined;
    default?: boolean;
    override?: boolean;
    profile?: string | undefined;
    components?: string[] | undefined;
}

export function getToolchainArgs(overrideFile: string): ToolchainOptions {
    const toolchainInput = input.getInput("toolchain", { required: false });
    let components: string[] | undefined = input.getInputList("components");
    if (components && components.length === 0) {
        components = undefined;
    }

    const toolchainFromFile = parseToolchainFile(overrideFile);

    if (!toolchainInput && !toolchainFromFile) {
        throw new Error(
            "toolchain input was not given and repository does not have a rust-toolchain file"
        );
    }

    return {
        name: toolchainInput || toolchainFromFile?.name || "",
        target: input.getInput("target") || toolchainFromFile?.target,
        default: input.getInputBool("default"),
        override: input.getInputBool("override"),
        profile: input.getInput("profile") || toolchainFromFile?.profile,
        components: components || toolchainFromFile?.components,
    };
}
