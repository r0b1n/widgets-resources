import { mkdir, rm } from "fs/promises";
import { execShellCommand } from "./shell";
import { PackageInfo } from "./getPackageInfo";

export async function cloneRepo(githubUrl: string, localFolder: string): Promise<void> {
    const githubUrlDomain = githubUrl.replace("https://", "");
    const githubUrlAuthenticated = `https://${process.env.GH_USERNAME}:${process.env.GH_PAT}@${githubUrlDomain}`;
    await rm(localFolder, { recursive: true, force: true });
    await mkdir(localFolder, { recursive: true });
    await execShellCommand(`git clone ${githubUrlAuthenticated} ${localFolder}`);
    await setLocalGitCredentials(localFolder);
}

async function setLocalGitCredentials(workingDirectory?: string): Promise<void> {
    await execShellCommand(`git config user.name "${process.env.GH_NAME}"`, workingDirectory);
    await execShellCommand(`git config user.email "${process.env.GH_EMAIL}"`, workingDirectory);
}

export async function commitAndCreatePullRequest(moduleInfo: PackageInfo): Promise<void> {
    const changelogBranchName = `${moduleInfo.nameWithDash}-release-${moduleInfo.version}`;
    await execShellCommand(
        `git checkout -b ${changelogBranchName} && git add . && git commit -m "chore(${moduleInfo.nameWithDash}): update changelogs" && git push --set-upstream origin ${changelogBranchName}`
    );
    await execShellCommand(
        `gh pr create --title "${moduleInfo.nameWithSpace}: Updating changelogs" --body "This is an automated PR." --base master --head ${changelogBranchName}`
    );
    console.log("Created PR for changelog updates.");
}

export async function createGithubRelease(
    moduleInfo: PackageInfo,
    moduleChangelogs: string,
    mpkOutput: string
): Promise<void> {
    console.log(`Creating Github release for module ${moduleInfo.nameWithSpace}`);
    await createGithubReleaseFrom({
        title: `${moduleInfo.nameWithSpace} ${moduleInfo.version} - Mendix ${moduleInfo.minimumMXVersion}`,
        notes: moduleChangelogs,
        tag: process.env.TAG!,
        filesToRelease: mpkOutput
    });
}

interface GitHubReleaseInfo {
    title: string;
    notes: string;
    tag: string;
    filesToRelease: string;
    isDraft?: boolean;
}

async function createGithubReleaseFrom({ title, notes, tag, filesToRelease, isDraft = false }: GitHubReleaseInfo) {
    const draftArgument = isDraft ? "--draft " : "";
    await execShellCommand(
        `gh release create --title "${title}" --notes "${notes}" ${draftArgument} "${tag}" "${filesToRelease}"`
    );
}
