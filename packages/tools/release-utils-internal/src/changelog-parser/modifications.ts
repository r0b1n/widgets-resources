import { ReleasedVersionEntry, UnreleasedVersionEntry, WidgetChangelogFile } from "./types";
import { Version } from "../version";

export function putUnreleasedAsVersion(changelog: WidgetChangelogFile, newVersion: Version): WidgetChangelogFile {
    const unreleased = changelog.content[0];

    if (unreleased.sections.length === 0) {
        throw new Error("Unreleased section is empty");
    }

    const emptyUnreleased: UnreleasedVersionEntry = {
        type: "unreleased",
        sections: []
    };

    const newRelease: ReleasedVersionEntry = {
        type: "normal",
        version: newVersion,
        date: new Date(),
        sections: unreleased.sections
    };

    return {
        header: changelog.header,
        content: [emptyUnreleased, newRelease, ...(changelog.content.slice(1) as ReleasedVersionEntry[])]
    };
}
