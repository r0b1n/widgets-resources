import { join } from "path";
import { access } from "fs/promises";
import { PackageJsonInfo, Version } from "./types";

export interface PackageInfo {
    nameWithDash: string;
    nameWithSpace: string;

    version: string;
    minimumMXVersion: `${number}.${number}.${number}`;

    url: string | undefined;

    changelogPath: string;

    testProjectUrl: string | undefined;
    testProjectBranchName: string | undefined;
}

export interface ModuleInfo extends PackageInfo {
    moduleNameInModeler: string;
    moduleFolderNameInModeler: string;
}

export async function getPackageInfo(path: string): Promise<PackageInfo | undefined> {
    const pkgPath = join(path, `package.json`);
    try {
        await access(pkgPath);
        const { name, widgetName, moduleName, version, marketplace, testProject, repository } = (await import(
            pkgPath
        )) as PackageJsonInfo;
        return {
            nameWithDash: name,
            nameWithSpace: moduleName ?? widgetName,
            version,
            minimumMXVersion: ensureVersion(marketplace?.minimumMXVersion),
            url: repository?.url,
            testProjectUrl: testProject?.githubUrl,
            testProjectBranchName: testProject?.branchName,
            changelogPath: `${path}/CHANGELOG.md`
        };
    } catch (error) {
        console.error(`ERROR: Path does not exist: ${pkgPath}`);
        return undefined;
    }
}

function ensureVersion(version: Version | undefined): Version {
    if (version && /\d+\.\d+\.\d+/.test(version)) {
        return version;
    }

    throw new Error(`Unknown version format '${version}'`);
}
