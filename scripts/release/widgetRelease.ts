import { getPackageInfo, PackageInfo } from "../../packages/tools/release-utils-internal/src";
import { writeWidgetChangelog } from "../../packages/tools/release-utils-internal/src/changelog-parser";
import { createGithubPRFrom, createGithubReleaseFrom } from "../../packages/tools/release-utils-internal/src/github";
import { putUnreleasedAsVersion } from "../../packages/tools/release-utils-internal/src/changelog-parser/modifications";
import { execShellCommand } from "../../packages/tools/release-utils-internal/src/shell";
import { setOriginAndAuthentication } from "../../packages/tools/release-utils-internal/src/git";
import { ls } from "shelljs";
import { join } from "path";
import { readdir } from "fs/promises";

main(process.argv[2]).catch(e => {
    console.error(e);
    process.exit(-1);
});

async function main(widgetScope: string): Promise<void> {
    if (!widgetScope.endsWith("-web")) {
        throw new Error(`${widgetScope} is not a valid widget package. Expected '*-web'.`);
    }

    const { releaseMpkPath, packageInfo } = await getWidgetReleaseInformation(widgetScope);

    // check if current version is already released
    if (packageInfo.changelog.content.some(c => "version" in c && c.version.equals(packageInfo.version))) {
        throw new Error(`Version ${packageInfo.version.format()} already exists in changelog file.`);
    }

    if (!packageInfo.changelog.content[0].sections.length) {
        // check if there are unreleased lines
        throw new Error(
            `No unreleased changes found in the CHANGELOG.md for ${
                packageInfo.packageName
            } ${packageInfo.version.format()}.`
        );
    }

    console.log("Starting widget release...");

    // set remote repo as origin
    await setOriginAndAuthentication(packageInfo.repositoryUrl);

    // create release
    console.log("Creating Github release...");
    await createGithubReleaseFrom({
        title: `${packageInfo.packageFullName} (Web) - Marketplace Release v${packageInfo.version.format()}`,
        notes: packageInfo.changelog.content[0].sections
            .map(s => `## ${s.type}\n\n${s.logs.map(l => `- ${l}`).join("\n\n")}`)
            .join("\n\n"),
        tag: `${packageInfo.packageName}-v${packageInfo.version.format()}`,
        filesToRelease: releaseMpkPath,
        isDraft: true
    });

    // update changelog
    console.log("Updating changelogs...");
    await updateChangelogsAndCreatePR(packageInfo);
    console.log("Done.");
}

async function getWidgetReleaseInformation(widgetScope) {
    // folder with all the widgets
    const pluggableWidgetsFolder = join(process.cwd(), "packages/pluggableWidgets");

    // list of widgets
    const pluggableWidgets = await readdir(pluggableWidgetsFolder);

    // check if widget exists
    if (!pluggableWidgets.includes(widgetScope)) {
        throw new Error(`${widgetScope} is not a valid pluggable widget.`);
    }

    // full path to the widget folder
    const widgetPath = join(pluggableWidgetsFolder, widgetScope);

    console.log(`Getting the widget release information for ${widgetScope} widget...`);

    // extract widget info
    const packageInfo = await getPackageInfo(widgetPath);

    const mpkFile = ls(join(widgetPath, "dist", "**/*.mpk")).toString();

    if (!mpkFile) {
        throw new Error("MPK file not found");
    }

    console.log(`MPK path: ${mpkFile}`);

    return {
        packageInfo,
        releaseMpkPath: mpkFile
    };
}

async function updateChangelogsAndCreatePR(packageInfo: PackageInfo): Promise<void> {
    const changelogBranchName = `${packageInfo.packageName}-release-${packageInfo.version.format()}`;
    // TODO: check if branch already exits on remote

    console.log(`Creating branch '${changelogBranchName}'...`);
    await execShellCommand(`git checkout -b ${changelogBranchName}`);

    console.log("Updating widget CHANGELOG.md...");
    writeWidgetChangelog(packageInfo.changelogPath, putUnreleasedAsVersion(packageInfo.changelog, packageInfo.version));

    console.log(`Committing and pushing '${changelogBranchName}' to origin...`);
    await execShellCommand([
        `git add . && git commit -m "chore(${packageInfo.packageName}): update changelogs"`,
        `git push --set-upstream origin ${changelogBranchName}`
    ]);

    console.log("Creating pull request");
    await createGithubPRFrom({
        title: `${packageInfo.packageFullName}: Updating changelogs`,
        body: "This is an automated PR.",
        base: "master",
        head: changelogBranchName
    });

    console.log("Created PR for changelog updates.");
}
