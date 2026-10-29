import Chart from "chart.js/auto"
import type { Plugin } from "chart.js"

interface OtdrEvent {
    distanceM: number
    traceY: number
    number: number
    kind: "reflective" | "non-reflective" | "multiple" | "unknown"
}

export function createOtdrEventMarkerPlugin(getEvents: () => readonly OtdrEvent[]): Plugin<"line"> {
    return {
        id: "otdr-event-markers",

        afterDatasetsDraw(chart) {
            const { ctx, chartArea, scales } = chart

            ctx.save()

            ctx.beginPath()
            ctx.rect(
                chartArea.left,
                chartArea.top,
                chartArea.right - chartArea.left,
                chartArea.bottom - chartArea.top
            )
            ctx.clip()

            ctx.strokeStyle = "#dc2626"
            ctx.fillStyle = "#dc2626"
            ctx.lineWidth = 1.5
            ctx.lineJoin = "round"
            ctx.lineCap = "round"
            ctx.font = "11px sans-serif"
            ctx.textAlign = "center"
            ctx.textBaseline = "bottom"

            for (const event of getEvents()) {
                const x = scales.x.getPixelForValue(event.distanceM)
                const traceY = scales.y.getPixelForValue(event.traceY)

                if (
                    !Number.isFinite(x) ||
                    !Number.isFinite(traceY)
                ) {
                    
                }
            }
        }
    }
}