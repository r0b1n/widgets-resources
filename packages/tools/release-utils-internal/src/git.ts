import { mkdir, rm } from "fs/promises";
import { execShellCommand } from "./shell";
import { PackageInfo } from "./package-info";
import { createGithubPRFrom, createGithubReleaseFrom } from "./github";

function getGHRepoAuthUrl(repoUrl: string): string {
    const url = new URL(repoUrl);
    url.username = process.env.GH_USERNAME!;
    url.password = process.env.GH_PAT!;

    return url.toString();
}

export async function cloneRepo(githubUrl: string, localFolder: string): Promise<void> {
    // clean up local folder
    await rm(localFolder, { recursive: true, force: true });
    await mkdir(localFolder, { recursive: true });

    // set credentials
    await setLocalGitCredentials(localFolder);

    // clone and set local credentials
    await execShellCommand(`git clone ${getGHRepoAuthUrl(githubUrl)} ${localFolder}`);
}

async function setLocalGitCredentials(workingDirectory?: string): Promise<void> {
    await execShellCommand(`git config user.name "${process.env.GH_NAME}"`, workingDirectory);
    await execShellCommand(`git config user.email "${process.env.GH_EMAIL}"`, workingDirectory);
}

export async function setOriginAndAuthentication(repoUrl: string) {
    // set credentials
    await setLocalGitCredentials();

    await execShellCommand(`git remote set-url origin ${getGHRepoAuthUrl(repoUrl)}`);
    await execShellCommand(`echo "${process.env.GH_PAT}" | gh auth login --with-token`);
}

export async function commitAndCreateChangelogUpdatePR(moduleInfo: PackageInfo): Promise<void> {
    const changelogBranchName = `${moduleInfo.packageName}-release-${moduleInfo.version.format()}`;

    // create branch and commit all changed files
    await execShellCommand([
        `git checkout -b ${changelogBranchName}`,
        `git add .`,
        `git commit -m "chore(${moduleInfo.packageName}): update changelogs"`,
        `git push --set-upstream origin ${changelogBranchName}`
    ]);

    await createGithubPRFrom({
        title: `${moduleInfo.packageFullName}: Updating changelogs`,
        body: "This is an automated PR.",
        base: "master",
        head: changelogBranchName
    });

    console.log("Created PR for changelog updates.");
}

export async function createModuleGithubRelease(
    moduleInfo: PackageInfo,
    moduleChangelogs: string,
    mpkOutput: string
): Promise<void> {
    console.log(`Creating Github release for module ${moduleInfo.packageFullName}`);
    await createGithubReleaseFrom({
        title: `${moduleInfo.packageFullName} ${moduleInfo.version} - Mendix ${moduleInfo.minimumMXVersion}`,
        notes: moduleChangelogs,
        tag: process.env.TAG!,
        filesToRelease: mpkOutput
    });
}
