import TOML from "@iarna/toml";
import { ToolchainOptions } from "./args";
import { existsSync, readFileSync } from "fs";
import { debug } from "@actions/core";

interface RustToolchainFileToolchain {
    channel: string;
    targets: string[] | undefined;
    profile: string | undefined;
    components: string[] | undefined;
}

interface RustToolchainFile {
    toolchain: RustToolchainFileToolchain;
}

export function parseToolchainFile(
    overrideFile: string
): ToolchainOptions | null {
    if (!existsSync(overrideFile)) {
        if (existsSync(`${overrideFile}.toml`)) {
            overrideFile = `${overrideFile}.toml`;
        } else {
            debug("Repository does not have a rust-toolchain file");

            return null;
        }
    }

    const rustToolchainFile = readFileSync(overrideFile, {
        encoding: "utf-8",
        flag: "r",
    }).trim();

    try {
        debug(`using toolchain from rust-toolchain file: ${rustToolchainFile}`);

        // eslint-disable-next-line
        const parsedToolchain = (TOML.parse(
            rustToolchainFile
        ) as unknown) as RustToolchainFile;

        return {
            name: parsedToolchain.toolchain.channel,
            target: parsedToolchain.toolchain.targets?.[0],
            profile: parsedToolchain.toolchain.profile,
            components: parsedToolchain.toolchain.components,
        };
    } catch (err) {
        debug(
            `using toolchain from old style rust-toolchain file: ${rustToolchainFile}`
        );

        return {
            name: rustToolchainFile,
            default: true,
            override: false,
        };
    }
}
