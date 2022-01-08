import { input } from "@actions-rs/core";
import { debug } from "@actions/core";
import { existsSync, readFileSync } from "fs";
import { parse } from "fast-toml";

export interface ToolchainOptions {
    name: string;
    target: string | undefined;
    default: boolean;
    override: boolean;
    profile: string | undefined;
    components: string[] | undefined;
}

function determineToolchain(overrideFile: string): string {
    const toolchainInput = input.getInput("toolchain", { required: false });

    if (toolchainInput) {
        debug(`using toolchain from input: ${toolchainInput}`);
        return toolchainInput;
    }

    const toolchainPath = existsSync(overrideFile)
        ? overrideFile
        : existsSync(`${overrideFile}.toml`)
        ? `${overrideFile}.toml`
        : undefined;

    if (!toolchainPath) {
        throw new Error(
            "toolchain input was not given and repository does not have a rust-toolchain file"
        );
    }

    const rustToolchainFile = readFileSync(toolchainPath, {
        encoding: "utf-8",
        flag: "r",
    }).trim();

    const toolchain = rustToolchainFile.includes("[toolchain]")
        ? parse<{ toolchain?: { channel?: string } }>(rustToolchainFile)
              ?.toolchain?.channel
        : rustToolchainFile;

    if (!toolchain) {
        throw new Error(`channel is not specified in ${toolchainPath}`);
    }

    debug(`using toolchain from rust-toolchain file: ${toolchain}`);

    return toolchain;
}

export function getToolchainArgs(overrideFile: string): ToolchainOptions {
    let components: string[] | undefined = input.getInputList("components");
    if (components && components.length === 0) {
        components = undefined;
    }

    return {
        name: determineToolchain(overrideFile),
        target: input.getInput("target") || undefined,
        default: input.getInputBool("default"),
        override: input.getInputBool("override"),
        profile: input.getInput("profile") || undefined,
        components: components,
    };
}
