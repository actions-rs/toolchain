import { getToolchainArgs } from "../src/args";
import { morph } from "mock-env";
import { sync as tempWriteSync } from "temp-write";

describe("actions-rs/toolchain", () => {
    it("Parses action input into toolchain options", () => {
        const args = morph(
            () => {
                return getToolchainArgs("./rust-toolchain");
            },
            {
                INPUT_TOOLCHAIN: "nightly-2019-04-20",
                INPUT_DEFAULT: "false",
                INPUT_OVERRIDE: "true",
            }
        );

        expect(args.name).toBe("nightly-2019-04-20");
        expect(args.default).toBe(false);
        expect(args.override).toBe(true);
    });

    it("uses input variable if rust-toolchain file does not exist", function () {
        const args = morph(
            () => {
                return getToolchainArgs("./rust-toolchain");
            },
            {
                INPUT_TOOLCHAIN: "nightly",
            }
        );

        expect(args.name).toBe("nightly");
    });

    it("toolchain input is required if rust-toolchain does not exist", function () {
        expect(() => getToolchainArgs("./rust-toolchain")).toThrowError();
    });

    it("prioritizes rust-toolchain file over input variable", function () {
        const rustToolchainFile = tempWriteSync("1.39.0");

        const args = morph(
            () => {
                return getToolchainArgs(rustToolchainFile);
            },
            {
                INPUT_TOOLCHAIN: "nightly",
            }
        );

        expect(args.name).toBe("nightly");
    });

    it("uses rust-toolchain file if input does not exist", function () {
        const rustToolchainFile = tempWriteSync("1.39.0");

        const args = morph(() => {
            return getToolchainArgs(rustToolchainFile);
        }, {});

        expect(args.name).toBe("1.39.0");
    });

    it("uses new style rust-toolchain file if input does not exist", function () {
        const rustToolchainFile = tempWriteSync(
            '[toolchain]\nchannel = "1.51.0"\ncomponents = [ "rustfmt", "clippy" ]\nprofile = "minimal"\ntargets = [ "wasm32-unknown-unknown", "thumbv2-none-eabi" ]'
        );

        const args = morph(() => {
            return getToolchainArgs(rustToolchainFile);
        }, {});

        expect(args.name).toBe("1.51.0");
        expect(args.components).toStrictEqual(["rustfmt", "clippy"]);
        expect(args.profile).toBe("minimal");
        expect(args.target).toBe("wasm32-unknown-unknown");
    });

    it("uses new style rust-toolchain file with toml ending if input and rust-toolchain file does not exist", function () {
        const rustToolchainFile = tempWriteSync(
            '[toolchain]\nchannel = "1.51.0"\ncomponents = [ "rustfmt", "clippy" ]\nprofile = "minimal"\ntargets = [ "wasm32-unknown-unknown", "thumbv2-none-eabi" ]',
            "./rust-toolchain.toml"
        );

        const args = morph(() => {
            return getToolchainArgs(rustToolchainFile.replace(/\.toml^/, ""));
        }, {});

        expect(args.name).toBe("1.51.0");
        expect(args.components).toStrictEqual(["rustfmt", "clippy"]);
        expect(args.profile).toBe("minimal");
        expect(args.target).toBe("wasm32-unknown-unknown");
    });

    it("trims content of the override file", function () {
        const rustToolchainFile = tempWriteSync("\n     1.39.0\n\n\n\n");

        const args = morph(() => {
            return getToolchainArgs(rustToolchainFile);
        }, {});

        expect(args.name).toBe("1.39.0");
    });
});
