import { execShellCommand } from "./shell";

interface GitHubReleaseInfo {
    title: string;
    notes: string;
    tag: string;
    filesToRelease: string;
    isDraft?: boolean;
}

export async function createGithubReleaseFrom({
    title,
    notes,
    tag,
    filesToRelease,
    isDraft = false
}: GitHubReleaseInfo): Promise<void> {
    const draftArgument = isDraft ? "--draft " : "";
    await execShellCommand(
        `gh release create --title "${title}" --notes "${notes}" ${draftArgument} "${tag}" "${filesToRelease}"`
    );
}

interface GitHubPRInfo {
    title: string;
    body: string;
    head: string;
    base: string;
}

export async function createGithubPRFrom(pr: GitHubPRInfo): Promise<void> {
    await execShellCommand(
        `gh pr create --title "${pr.title}" --body "${pr.body}" --base ${pr.base} --head ${pr.head}`
    );
}
