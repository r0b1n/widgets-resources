import { join } from "path";
import { access } from "fs/promises";
import { PackageJsonInfo, Version } from "../types";

export interface PackageInfo {
    nameWithDash: string;
    nameWithSpace: string;

    version: Version;
    minimumMXVersion: Version;

    url: string | undefined;

    changelogPath: string;

    testProjectUrl: string | undefined;
    testProjectBranchName: string | undefined;
}

export interface ModuleInfo extends PackageInfo {
    moduleNameInModeler: string;
    moduleFolderNameInModeler: string;
}

export async function getPackageInfo(packagePath: string): Promise<PackageInfo | undefined> {
    const pkgPath = join(packagePath, `package.json`);
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
            changelogPath: `${packagePath}/CHANGELOG.md`
        };
    } catch (error) {
        console.error(`ERROR: Path does not exist: ${pkgPath}`);
        return undefined;
    }
}

function ensureVersion(version: Version | undefined): Version {
    if (
        version?.length === 3 &&
        typeof version[0] === "number" &&
        typeof version[1] === "number" &&
        typeof version[2] === "number"
    ) {
        return version;
    }

    throw new Error(`Unknown version format '${version}'`);
}
