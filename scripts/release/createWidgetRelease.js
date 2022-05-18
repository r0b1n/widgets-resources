const { readdir } = require("fs/promises");
const { join } = require("path");
const { ls } = require("shelljs");
const {
    getUnreleasedChangelogs,
    writeToWidgetChangelogs,
    githubAuthentication,
    createGithubReleaseFrom,
    commitAndCreatePullRequest
} = require("./module-automation/commons");

main().catch(e => {
    console.error(e);
    process.exit(-1);
});

async function main() {
    const widgetScope = process.argv[2];

    if (!widgetScope.endsWith("-web")) {
        throw new Error(`${widgetScope} is not a valid widget package.`);
    }

    const { releaseMpkPath, repositoryUrl, unreleasedChangelogs, version, widgetName, changelogPath } =
        await getWidgetReleaseInformation(widgetScope);

    if (!unreleasedChangelogs) {
        throw new Error(`No unreleased changes found in the CHANGELOG.md for ${widgetName} ${version}.`);
    }

    console.log("Starting widget release...");
    await githubAuthentication({ url: repositoryUrl });
    console.log("Creating Github release...");
    await createGithubReleaseFrom({
        title: `${widgetName} (Web) - Marketplace Release v${version}`,
        body: unreleasedChangelogs.replace(/"/g, "'"),
        tag: `${widgetScope}-v${version}`,
        mpkOutput: releaseMpkPath,
        isDraft: true
    });

    // update changelog
    console.log("Updating widget CHANGELOG.md...");
    await writeToWidgetChangelogs(unreleasedChangelogs, { changelogPath, version });
    console.log("Creating pull request for CHANGELOG.md...");
    await commitAndCreatePullRequest({ nameWithDash: widgetScope, version, nameWithSpace: widgetName });
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

    // full path to package json
    const pkgPath = join(widgetPath, "package.json");

    // extract widget info
    const { name, widgetName, version, repository } = require(pkgPath);

    console.log(`Getting the widget release information for ${widgetName} widget...`);

    if (!name || !widgetName || !version || !version.includes(".") || !repository?.url) {
        throw new Error(`${pkgPath} does not define expected keys.`);
    }

    if (version.split(".").length !== 3) {
        throw new Error(`${pkgPath} version is not defined correctly.`);
    }

    const mpkFile = ls(join(widgetPath, "dist", "**/*.mpk")).toString();

    if (!mpkFile) {
        throw new Error("MPK file not found");
    }

    console.log(`MPK path: ${mpkFile}`);
    const changelogPath = join(widgetPath, "CHANGELOG.md");

    return {
        releaseMpkPath: mpkFile,
        repositoryUrl: repository.url,
        unreleasedChangelogs: await getUnreleasedChangelogs({ version, changelogPath }),
        version,
        widgetName,
        changelogPath
    };
}
