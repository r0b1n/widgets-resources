export type Version = [major: number, minor: number, patch: number];

export interface PackageJsonInfo {
    name: string;
    version: string;

    widgetName: string;
    moduleName: string;

    marketplace?: {
        minimumMXVersion: Version;
        marketplaceId: string;
    };
    testProject?: {
        githubUrl: string;
        branchName: string;
    };
    repository?: {
        type: "git";
        url: string;
    };
}
