import type { SorReader } from "./otdr/sor-reader";
import type { KeyEventTranslated } from "./otdr/sor/blocks";

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
        const str = getFieldAsString(val);

        const elem = document.getElementById(`output-${key}`) as HTMLElement;
        elem.textContent = str;
    }

    createEventsTable(sorReader);
}

function createEventsTable(sorReader: SorReader) {
    const eventsTblBodyEl = document.getElementById("events-table-body") as HTMLElement;
    const noEventsRowEl = document.getElementById("no-events-row") as HTMLElement;

    const keyEvents = sorReader.parsedFile().translatedBlocks.keyEvents?.keyEvents;

    if (keyEvents === undefined) {
        noEventsRowEl.hidden = false;
        return;
    }

    const propsToInclude = new Map(Object.entries({
        "eventNumber": "Event #",
        "timeOfTravel_m": "Distance (m)",
        "slope_dB": "Slope (dB)",
        "spliceLoss_dB": "Splice loss (dB)",
        "reflectionLoss_dB": "Reflection loss (dB)",
        "eventType": "Event type",
        "comments": "Comments"
    }));

    const headingTR = document.createElement("tr");
    for (const [prop, propDesc] of propsToInclude) {
        const headingTD = document.createElement("td");
        headingTD.textContent = propDesc;
        headingTR.appendChild(headingTD);
    }

    eventsTblBodyEl.appendChild(headingTR);

    for (let i = 0; i < keyEvents.length; i++) {
        const newRow = constructEventRow(keyEvents[i], [...propsToInclude.keys()]);
        eventsTblBodyEl.appendChild(newRow);
    }
}

function constructEventRow(keyEvent: KeyEventTranslated, props: string[]): HTMLTableRowElement {
    const newTR = document.createElement("tr");

    for (const [key, value] of new Map(Object.entries(keyEvent))) {
        if (!props.includes(key)) continue;

        const newTD = document.createElement("td");
        newTD.textContent = value;
        newTR.appendChild(newTD);
    }

    return newTR;
}