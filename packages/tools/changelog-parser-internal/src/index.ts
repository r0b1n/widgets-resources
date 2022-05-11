import { readFileSync, writeFileSync } from "fs";
import { parse as parseWidgetChangelogFile } from "../parser/widget/widget";
import { parse as parseModuleChangelogFile } from "../parser/module/module";
import {
    LogSection,
    ModuleChangelogFile,
    ModuleReleasedVersionEntry,
    ModuleUnreleasedVersionEntry,
    NoteEntry,
    SubComponentEntry,
    VersionEntry,
    WidgetChangelogFile
} from "./types";

export function readWidgetChangelog(filePath: string): WidgetChangelogFile {
    const fileContent = readFileSync(filePath);

    return parseWidgetChangelogFile(fileContent.toString());
}

export function writeWidgetChangelog(filePath: string, content: WidgetChangelogFile): void {
    console.log(content);
    const fileContent =
        [...formatHeader(content.header), ...content.content.flatMap(formatVersionEntry)].join("\n\n") + "\n";

    writeFileSync(filePath, fileContent);
}

export function readModuleChangelog(filePath: string): ModuleChangelogFile {
    const fileContent = readFileSync(filePath);

    return parseModuleChangelogFile(fileContent.toString());
}

export function writeModuleChangelog(filePath: string, content: ModuleChangelogFile): void {
    const fileContent =
        [
            ...formatHeader(content.header),
            ...content.content.flatMap(v => formatModuleVersionEntry(v, content.moduleName))
        ].join("\n\n") + "\n";

    writeFileSync(filePath, fileContent);
}

function formatHeader(header: string): string[] {
    return [
        "# Changelog",
        header,
        "The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)."
    ];
}

function formatModuleVersionEntry(
    v: NoteEntry | ModuleReleasedVersionEntry | ModuleUnreleasedVersionEntry,
    moduleName: string
): string[] {
    if (v.type === "note") {
        return [`## ${v.title}`, v.text];
    }

    return [
        v.type === "normal" ? `## [${v.version.join(".")}] ${moduleName} - ${formatDate(v.date)}` : "## [Unreleased]",
        ...v.sections.flatMap(formatSectionEntry(3)),
        ...v.subcomponents.flatMap(formatSubcomponentEntry)
    ];
}

function formatSubcomponentEntry(v: SubComponentEntry): string[] {
    let result: string[] = [];
    if ("version" in v) {
        result.push(`### [${v.version.join(".")}] ${v.name}`);
    } else {
        result.push(`### ${v.name}`);
    }

    result = result.concat(v.sections.flatMap(formatSectionEntry(4)));

    return result;
}

function formatVersionEntry(v: VersionEntry): string[] {
    if (v.type === "note") {
        return [`## ${v.title}`, v.text];
    }

    return [
        v.type === "normal" ? `## [${v.version.join(".")}] - ${formatDate(v.date)}` : "## [Unreleased]",
        ...v.sections.flatMap(formatSectionEntry(3))
    ];
}

const formatSectionEntry =
    (depth = 3) =>
    (s: LogSection): string[] => {
        return [`${"#".repeat(depth)} ${s.type}`, ...s.logs.map(formatChangeEntry)];
    };

function formatChangeEntry(c: string): string {
    return `-   ${c}`;
}

function formatDate(date: Date): string {
    return `${date?.getFullYear()}-${(date?.getMonth() + 1).toString().padStart(2, "0")}-${date
        ?.getDate()
        .toString()
        .padStart(2, "0")}`;
}
