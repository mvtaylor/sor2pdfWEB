import type { SorReader } from "./otdr/sor-reader";

export function getFieldAsString(value: any): string {
    let val = "";
    if (value === null) {
        val = "<empty>";
    } else if (typeof value === "string" && value.trim() === "") {
        val = "<empty>";
    } else if (typeof val === "number") {
        val = value.toString();
    } else if (value instanceof Date) {
        val = value.toUTCString();
    } else {
        val = value;
    }

    return val;
}

export function setResults(sorReader: SorReader) {
    const generalInformationMap = new Map(
        Object.entries(sorReader.results().generalInformation),
    );
    for (const [k, v] of generalInformationMap) {
        const elem = document.getElementById(`output-${k}`) as HTMLElement;
        const val = getFieldAsString(v);

        if (elem !== null && elem.textContent !== null && val)
            elem.textContent = val;
    }

    const resultsMap = new Map(Object.entries(sorReader.results().results));
    for (const [key, val] of resultsMap) {
        const tblRowElem = document.createElement("tr");

        const str = getFieldAsString(val);

        const elem = document.getElementById(`output-${key}`) as HTMLElement;
        elem.textContent = str;
    }
}
