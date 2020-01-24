import * as exec from '@actions/exec';
import * as core from '@actions/core';

export async function gatherInstalledVersions(): Promise<void> {
    try {
        core.startGroup('Gathering installed versions');

        await rustc();
        await cargo();
        await rustup();
    } finally {
        core.endGroup();
    }
}

/**
 * Fetch currently used `rustc` version
 */
async function rustc(): Promise<void> {
    const stdout = await getStdout('rustc', ['-V']);
    const version = parse(stdout);

    core.setOutput('rustc', version.long);
//     core.setOutput('rustc_short', version.short);
}

/**
 * Fetch currently used `cargo` version
 */
async function cargo(): Promise<void> {
    const stdout = await getStdout('cargo', ['-V']);
    const version = parse(stdout);

    core.setOutput('cargo', version.long);
//     core.setOutput('cargo_short', version.short);
}

async function rustup(): Promise<void> {
    const stdout = await getStdout('rustup', ['-V']);
    const version = parse(stdout);

    core.setOutput('rustup', version.long);
//     core.setOutput('rustup_short', version.short);
}

interface Version {
    short: string,
    long: string,
}

function parse(stdout: string): Version {
    stdout = stdout.trim();
    const matches = stdout.match(/\S+\s((\S+)\s\(.+\))/m);
    if (matches == null) {
        throw new Error(`Unable to parse version from the "${stdout}" string`);
    }

    return {
        short: matches[2],
        long: matches[1],
    }
}

async function getStdout(exe: string, args: string[], options?: {}): Promise<string> {
    let stdout = '';
    const resOptions = Object.assign({}, options, {
        listeners: {
            stdout: (buffer: Buffer) => {
                stdout += buffer.toString();
            },
        },
    });

    await exec.exec(exe, args, resOptions);

    return stdout;
}
