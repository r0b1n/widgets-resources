import { join } from "path";
import { access } from "fs/promises";
import { Version, VersionString } from "./version";
import { readWidgetChangelog } from "./changelog-parser";
import { WidgetChangelogFile } from "./changelog-parser/types";

export interface PackageJsonFileContent {
    name?: string;
    widgetName?: string;
    moduleName?: string;
    version?: VersionString;

    repository?: {
        type: "git";
        url: string;
    };

    marketplace?: {
        minimumMXVersion: VersionString;
        marketplaceId?: string;
    };

    testProject?: {
        githubUrl: string;
        branchName: string;
    };

    packagePath?: string;
}

export interface PackageInfo {
    packageName: string;
    packageFullName: string;

    version: Version;
    minimumMXVersion: Version;

    repositoryUrl: string;

    changelogPath: string;
    changelog: WidgetChangelogFile;

    testProjectUrl: string | undefined;
    testProjectBranchName: string | undefined;
}

export interface ModuleInfo extends PackageInfo {
    moduleNameInModeler: string;
    moduleFolderNameInModeler: string;
}

export async function getPackageInfo(path: string): Promise<PackageInfo> {
    const pkgPath = join(path, `package.json`);
    try {
        await access(pkgPath);
        const { name, widgetName, moduleName, version, marketplace, testProject, repository } = (await import(
            pkgPath
        )) as PackageJsonFileContent;
        return {
            packageName: ensureString(name, "name"),
            packageFullName: ensureString(moduleName ?? widgetName, "moduleName or widgetName"),

            version: ensureVersion(version),

            minimumMXVersion: ensureVersion(marketplace?.minimumMXVersion),
            repositoryUrl: ensureString(repository?.url, "repository.url"),

            changelogPath: `${path}/CHANGELOG.md`,
            changelog: readWidgetChangelog(`${path}/CHANGELOG.md`),

            testProjectUrl: testProject?.githubUrl,
            testProjectBranchName: testProject?.branchName
        };
    } catch (error) {
        console.error(`ERROR: Path does not exist: ${pkgPath}`);
        throw new Error("Error while reading widget info at " + path);
    }
}

function ensureString(str: string | undefined, fieldName: string): string {
    if (typeof str === "undefined") {
        throw new Error(`Expected to be string got undefined for '${fieldName}'`);
    }

    return str;
}

function ensureVersion(version: VersionString | undefined): Version {
    if (version && /\d+\.\d+\.\d+/.test(version)) {
        return Version.fromString(version);
    }

    throw new Error(`Unknown version format, cant parse: '${version}'`);
}
