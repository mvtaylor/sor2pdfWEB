import { SorReader } from "./otdr/sor-reader";
import type { KeyEventTranslated } from "./otdr/sor/blocks";
import { unwrapObject } from "./utils";

export interface Marker {
    id: string;
    x: number;
    y: number;
    label: string;
}

export function getFieldAsString(value: any, allowEmpty = false): string {
    let val = "";
    if (value === null) {
        val = "<empty>";
    } else if (typeof value === "string" && value.trim() === "") {
        val = allowEmpty ? value : "<empty>";
    } else if (typeof value === "number") {
        val = value.toFixed(3);
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

    eventsTblBodyEl.querySelectorAll(".dynamic-event-row").forEach((row) => row.remove());

    const keyEvents = sorReader.parsedFile().translatedBlocks.keyEvents?.keyEvents;

    if (keyEvents === undefined) {
        noEventsRowEl.hidden = false;
        return;
    }

    noEventsRowEl.hidden = true;

    const propsToInclude = new Map(Object.entries({
        "eventNumber": "Event #",
        "timeOfTravel_m": "Distance (m)",
        "slope_dBPerkm": "Slope (dB/km)",
        "spliceLoss_dB": "Splice loss (dB)",
        "reflectionLoss_dB": "Reflection loss (dB)",
        "eventType": "Event type",
        "comments": "Comments"
    }));

    const processingFns: Map<string,((value: KeyEventTranslated) => string)> = new Map();
    processingFns.set("reflectionLoss_dB", (ev) => {
        return ev.reflectionLoss_dB.toFixed(3);
    });
    processingFns.set("eventNumber", (ev) => {
        return ev.eventNumber.toFixed(0);
    });

    const headingTR = document.createElement("tr");
    headingTR.classList.add("events-table-header", "dynamic-event-row");
    for (const [prop, propDesc] of propsToInclude) {
        const headingTD = document.createElement("td");
        headingTD.textContent = propDesc;
        headingTR.appendChild(headingTD);
    }

    eventsTblBodyEl.appendChild(headingTR);

    for (let i = 0; i < keyEvents.length; i++) {
        const newRow = constructEventRow(keyEvents[i], [...propsToInclude.keys()], processingFns);
        eventsTblBodyEl.appendChild(newRow);
    }
}

function constructEventRow(keyEvent: KeyEventTranslated, props: string[], processingFns?: Map<string,((value: KeyEventTranslated) => string)>): HTMLTableRowElement {
    const newTR = document.createElement("tr");
    newTR.classList.add("dynamic-event-row");

    //const unwrapped = new Map(Object.entries(keyEvent))

    const unwrapped = unwrapObject(keyEvent)

    for (const [key, value] of unwrapped) {
        if (!props.includes(key)) continue;

        let newValue = value;
        const possibleFn = processingFns?.get(key);
        if (possibleFn !== undefined) {
            newValue = possibleFn(keyEvent);
        }
        newValue = getFieldAsString(newValue, true);

        const newTD = document.createElement("td");
        newTD.textContent = newValue;
        newTR.appendChild(newTD);
    }

    return newTR;
}

export function calculateWithMarkers(markers: Marker[]): void {
    const dataPoints: [number, number][] = [];
    for (const marker of markers) {
        dataPoints.push([marker.x, marker.y]);
    }

    const avgSlope = SorReader.calcAvgSlope(dataPoints);
    
    const elem = document.getElementById("output-averageSlope_dbPerkm") as HTMLTableCellElement;
    elem.textContent = avgSlope.toFixed(3);
}