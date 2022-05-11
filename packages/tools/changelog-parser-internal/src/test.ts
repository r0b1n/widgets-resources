import { readModuleChangelog, readWidgetChangelog, writeModuleChangelog, writeWidgetChangelog } from "./";
import { existsSync, readdirSync } from "fs";
import { resolve } from "path";

function reformatPackageChangelog(filePath: string): void {
    try {
        writeWidgetChangelog(filePath, readWidgetChangelog(filePath));
    } catch (e) {
        console.log(e);
        process.exit();
    }
}

function reformatModuleChangelog(filePath: string): void {
    try {
        writeModuleChangelog(filePath, readModuleChangelog(filePath));
    } catch (e) {
        console.log(e);
        process.exit();
    }
}

function processChangelogsWith(dir: string, process: (string) => void): void {
    readdirSync(dir)
        .filter(f => !f.startsWith("."))
        .forEach(p => {
            const changelogFile = resolve(dir, p, "CHANGELOG.md");
            if (existsSync(changelogFile)) {
                console.log("Processing", changelogFile);
                process(changelogFile);
            } else {
                console.log("Not found", changelogFile);
            }
        });
}

console.log(reformatModuleChangelog);
console.log(reformatPackageChangelog);

// single packages
// processChangelogsWith(resolve(__dirname, "..", "..", "..", "packages", "pluggableWidgets"), reformatPackageChangelog);
// processChangelogsWith(resolve(__dirname, "..", "..", "..", "packages", "customWidgets"), reformatPackageChangelog);
// processChangelogsWith(resolve(__dirname, "..", "..", "..", "packages", "tools"), reformatPackageChangelog);
//
// // modules
processChangelogsWith(resolve(__dirname, "..", "..", "..", "..", "packages", "modules"), reformatModuleChangelog);
processChangelogsWith(resolve(__dirname, "..", "..", "..", "..", "packages", "jsActions"), reformatModuleChangelog);
