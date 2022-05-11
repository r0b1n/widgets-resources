import { basename, join } from "path";

import { execShellCommand, getFiles } from "./shell";
import { ModuleInfo } from "./getPackageInfo";

// create docker image
// run in docker

async function ensureMxBuildDockerImageExists(mendixVersion: string) {
    const existingImages = (await execShellCommand(`docker image ls -q mxbuild:${mendixVersion}`)).toString().trim();
    if (!existingImages) {
        console.log(`Creating new mxbuild:${mendixVersion} docker image...`);
        const dockerfilePath = join(process.cwd(), "packages/tools/pluggable-widgets-tools/scripts/mxbuild.Dockerfile");
        await execShellCommand(
            `docker build -f ${dockerfilePath} ` +
                `--build-arg MENDIX_VERSION=${mendixVersion} ` +
                `-t mxbuild:${mendixVersion} ${process.cwd()}`
        );
    }
}

export async function createModuleMpkInDocker(
    sourceDir: string,
    moduleName: string,
    mendixVersion: `${number}.${number}.${number}`,
    excludeFilesRegExp: string
): Promise<void> {
    await ensureMxBuildDockerImageExists(mendixVersion);

    console.log(`Creating module ${moduleName} using mxbuild:${mendixVersion}...`);
    // Build testProject via mxbuild
    const projectFile = basename((await getFiles(sourceDir, [`.mpr`]))[0]);
    const args = [
        // update widgets
        "mx",
        "update-widgets",
        "--loose-version-check",
        `/source/${projectFile}`,
        "&&",

        // then create module
        "mono",
        "/tmp/mxbuild/modeler/mxutil.exe create-module-package",
        excludeFilesRegExp ? `--exclude-files='${excludeFilesRegExp}'` : "",
        `/source/${projectFile}`,
        moduleName
    ].join(" ");

    await execShellCommand(
        `docker run -t -v ${sourceDir}:/source ` + `--rm mxbuild:${mendixVersion} bash -c "${args}"`
    );
    console.log(`Module ${moduleName} created successfully.`);
}

export async function createMPK(
    tmpFolder: string,
    moduleInfo: ModuleInfo,
    excludeFilesRegExp: string
): Promise<string> {
    console.log("Creating module MPK..");
    await createModuleMpkInDocker(
        tmpFolder,
        moduleInfo.moduleNameInModeler,
        moduleInfo.minimumMXVersion,
        excludeFilesRegExp
    );
    return (await getFiles(tmpFolder, [`.mpk`]))[0];
}
