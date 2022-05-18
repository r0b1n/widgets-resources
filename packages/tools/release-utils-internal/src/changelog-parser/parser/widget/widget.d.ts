import { WidgetChangelogFile } from "../../types";

interface Location {
    line: number;
    column: number;
    offset: number;
}

interface LocationRange {
    start: Location;
    end: Location;
}

export class SyntaxError {
    line: number;
    column: number;
    offset: number;
    location: LocationRange;
    expected: any[];
    found: any;
    name: string;
    message: string;
}

export function parse(fileContent: string, options: object): WidgetChangelogFile;
