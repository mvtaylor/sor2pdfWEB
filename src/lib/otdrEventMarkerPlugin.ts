import Chart from "chart.js/auto"
import type { Plugin } from "chart.js"

interface OtdrEvent {
    distanceM: number
    traceY: number
    number: number
    kind: "reflective" | "non-reflective" | "multiple" | "unknown"
}

export function createOtdrEventMarkerPlugin(getEvents: () => readonly OtdrEvent[]): Plugin<"line"> {
    
}