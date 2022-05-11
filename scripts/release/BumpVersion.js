"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const child_process_1 = require("child_process");
// eslint-disable-next-line no-console
main().catch(console.error);
async function main() {
    const args = process.argv.slice(2);
    const target = args[0];
    const bumpVersionType = args[1];
    const packages = ["packages/pluggableWidgets"];
    const path = await findPath(packages, target);
    const currentVersion = await getCurrentVersion(path);
    const newVersion = getNewVersion(bumpVersionType, currentVersion);
    console.log("Target:", target);
    console.log("Current version:", currentVersion);
    console.log("New version:", newVersion, "\n");
    console.log("Bumping package.json version...");
    bumpPackageJson(path, newVersion);
    console.log("Bumping XML version...");
    await bumpXml(path, newVersion);
    console.log("Done.");
}
function getNewVersion(bumpVersionType, currentVersion) {
    const [major, minor, patch] = currentVersion.split(".");
    switch (bumpVersionType) {
        case "patch":
            return [major, minor, Number(patch) + 1].join(".");
        case "minor":
            return [major, Number(minor) + 1, patch].join(".");
        case "major":
            return [Number(major) + 1, minor, patch].join(".");
        default:
            return bumpVersionType;
    }
}
async function getCurrentVersion(path) {
    const contentBuffer = await fs_1.promises.readFile((0, path_1.join)(path, "package.json"));
    const content = JSON.parse(contentBuffer.toString());
    return content.version;
}
function bumpPackageJson(path, version) {
    (0, child_process_1.spawnSync)("npm", ["version", version], { cwd: path });
}
async function findPath(packages, target) {
    for (const pack of packages) {
        const folders = await fs_1.promises.readdir(pack);
        for (const folder of folders) {
            const pathToPackage = (0, path_1.join)(pack, folder);
            try {
                const stat = await fs_1.promises.stat((0, path_1.join)(pathToPackage, "package.json"));
                if (stat) {
                    const contentBuffer = await fs_1.promises.readFile((0, path_1.join)(pathToPackage, "package.json"));
                    const content = JSON.parse(contentBuffer.toString());
                    if (content.name === target) {
                        return pathToPackage;
                    }
                }
                // eslint-disable-next-line no-empty
            } catch (e) {}
        }
    }
    throw Error(`Package for ${target} not found`);
}
async function bumpXml(path, version) {
    const packageXmlFile = (0, path_1.join)(path, "src", "package.xml");
    try {
        const content = await fs_1.promises.readFile(packageXmlFile);
        if (content) {
            const newContent = content.toString().replace(/version=.+xmlns/, `version="${version}" xmlns`);
            await fs_1.promises.writeFile(packageXmlFile, newContent);
            return true;
        }
        return false;
    } catch (e) {
        throw new Error("package.xml not found");
    }
}
