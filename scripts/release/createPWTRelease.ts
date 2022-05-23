import { getPackageInfo, PackageInfo } from "../../packages/tools/release-utils-internal/src";
import gh from "../../packages/tools/release-utils-internal/src/github";
// import { execShellCommand } from "../../packages/tools/release-utils-internal/src/shell";
// import { addRemoteWithAuthentication } from "../../packages/tools/release-utils-internal/src/git";
// import { ls } from "shelljs";
import { join } from "path";
import { addRemoteWithAuthentication } from "../../packages/tools/release-utils-internal/src/git";
import { execShellCommand } from "../../packages/tools/release-utils-internal/dist/shell";

main().catch(e => {
    console.error(e);
    process.exit(-1);
});

async function main(): Promise<void> {
    const pwtPath = join(process.cwd(), "packages/tools/pluggable-widgets-tools");

    // 1. Get widget info
    console.log(`Getting the widget release information for pluggable-widget-tools...`);
    console.log(`directory:`, pwtPath);

    const packageInfo = await getPackageInfo(pwtPath);
    packageInfo.packageFullName = "Pluggable Widgets Tools";
    const releaseTag = `pluggable-widgets-tools-v${packageInfo.version.format()}`;

    // 2. Check prerequisites

    // 2.1. Check if current version is already in CHANGELOG
    if (packageInfo.changelog.hasVersion(packageInfo.version)) {
        throw new Error(`Version ${packageInfo.version.format()} already exists in CHANGELOG.md file.`);
    }

    // 2.2. Check if there is something to release (entries under "Unreleased" section)
    if (!packageInfo.changelog.hasUnreleasedLogs()) {
        throw new Error(
            `No unreleased changes found in the CHANGELOG.md for ${
                packageInfo.packageName
            } ${packageInfo.version.format()}.`
        );
    }

    // 2.3. Check there is no release of that version on GitHub
    const releaseId = await gh.getReleaseIdByReleaseTag(releaseTag);
    if (releaseId) {
        throw new Error(`There is already a release for tag '${releaseTag}'.`);
    }

    // 4. Do release
    console.log("Starting pluggable-widget-tools release...");

    const remoteName = `origin-${packageInfo.packageName}-v${packageInfo.version.format()}-${makeid()}`;

    console.log(remoteName);

    // 4.1 Set remote repo as origin
    await addRemoteWithAuthentication(packageInfo.repositoryUrl, remoteName);

    // 4.2 Update CHANGELOG.md and create PR
    console.log("Creating PR with updated CHANGELOG.md file...");
    await updateChangelogsAndCreatePR(packageInfo, releaseTag, remoteName);

    process.exit(1);

    // 4.3 Create release
    console.log("Creating Github release...");
    await gh.createGithubReleaseFrom({
        title: `${packageInfo.packageFullName} (Web) - Marketplace Release v${packageInfo.version.format()}`,
        notes: packageInfo.changelog.changelog.content[0].sections
            .map(s => `## ${s.type}\n\n${s.logs.map(l => `- ${l}`).join("\n\n")}`)
            .join("\n\n"),
        tag: releaseTag,
        isDraft: true,
        repo: packageInfo.repositoryUrl
    });

    console.log("Done.");
}

async function updateChangelogsAndCreatePR(
    packageInfo: PackageInfo,
    branchName: string,
    remoteName: string
): Promise<void> {
    const changelogBranchName = branchName;

    console.log(`Creating branch '${changelogBranchName}'...`);
    await execShellCommand(`git checkout -b ${changelogBranchName}`);

    console.log("Updating package CHANGELOG.md...");
    const updatedChangelog = packageInfo.changelog.moveUnreleasedToVersion(packageInfo.version);
    updatedChangelog.save();

    console.log(`Committing CHANGELOG.md to '${changelogBranchName}' and pushing to remote...`);
    await execShellCommand([
        `git add ${packageInfo.changelog.changelogPath}`,
        `git commit -m "chore(${packageInfo.packageName}): update changelogs"`,
        `git push ${remoteName} ${changelogBranchName}`
    ]);

    console.log(`Creating pull request for '${changelogBranchName}'`);
    await gh.createGithubPRFrom({
        title: `${packageInfo.packageFullName}: Update changelogs`,
        body: "This is an automated PR.",
        base: "master",
        head: changelogBranchName,
        repo: packageInfo.repositoryUrl
    });

    console.log("Created PR for changelog updates.");
}

function makeid(length = 4): string {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
