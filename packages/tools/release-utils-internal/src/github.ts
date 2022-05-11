import { execShellCommand } from "./shell";

interface GitHubReleaseInfo {
    title: string;
    notes: string;
    tag: string;
    filesToRelease: string;
    isDraft?: boolean;
    repo?: string;
}

interface GitHubPRInfo {
    title: string;
    body: string;
    head: string;
    base: string;
    repo?: string;
}

export class GitHub {
    authSet = false;

    private async ensureAuth(): Promise<void> {
        if (!this.authSet) {
            await execShellCommand(`echo "${process.env.GH_PAT}" | gh auth login --with-token`);
        }
    }

    async createGithubPRFrom(pr: GitHubPRInfo): Promise<void> {
        await this.ensureAuth();

        const repoArgument = pr.repo ? `-R "${pr.repo}"` : "";

        await execShellCommand(
            `gh pr create --title "${pr.title}" --body "${pr.body}" --base ${pr.base} --head ${pr.head} ${repoArgument}`
        );
    }

    async createGithubReleaseFrom({
        title,
        notes,
        tag,
        filesToRelease,
        isDraft = false,
        repo
    }: GitHubReleaseInfo): Promise<void> {
        await this.ensureAuth();

        const draftArgument = isDraft ? "--draft" : "";
        const repoArgument = repo ? `-R "${repo}"` : "";

        await execShellCommand(
            `gh release create --title "${title}" --notes "${notes}" ${draftArgument} ${repoArgument} "${tag}" "${filesToRelease}"`
        );
    }
}

export default new GitHub();

// export async function getReleaseMkpArtifacts(tag: string): Promise<string> {
//     console.log(`Searching for release from Github tag ${tag}`);
//
//     const request = await fetch("GET", "https://api.github.com/repos/mendix/widgets-resources/releases?per_page=10");
//
//     const data = (await request) ?? [];
//
//     const releaseId = data.find(info => info.tag_name === tag)?.id;
//     if (!releaseId) {
//         throw new Error(`Could not find release with tag ${tag} on GitHub`);
//     }
//     const assetsRequest = await fetch(
//         "GET",
//         `https://api.github.com/repos/mendix/widgets-resources/releases/${releaseId}/assets`
//     );
//     const assetsData = (await assetsRequest) ?? [];
//     const downloadUrl = assetsData.find(asset => asset.name.endsWith(".mpk"))?.browser_download_url;
//     if (!downloadUrl) {
//         throw new Error(`Could not retrieve MPK url from GitHub release with tag ${process.env.TAG}`);
//     }
//     return downloadUrl;
// }
