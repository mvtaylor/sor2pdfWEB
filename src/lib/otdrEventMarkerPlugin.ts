import Chart from "chart.js/auto"
import type { Plugin } from "chart.js"
import type { KeyEventTranslated } from "./otdr/sor/blocks"

const eventKinds = ["reflective", "non-reflective", "multiple", "unknown"]

interface OtdrEvent {
    distanceM: number
    traceY: number
    number: number
    kind: typeof eventKinds[number]
}

export function keyEvTrToOtdrEvent(event: KeyEventTranslated, tracedata: [number, number][]): OtdrEvent {
    const evNum = event.eventNumber
    const kind = eventKinds.includes(event.eventType) ? event.eventType : "unknown"
    const x = event.timeOfTravel_m
    const pair = tracedata.find(pair => {
        return Math.abs(x - pair[0]) < 1
    })
    
    if (!pair) throw new Error("Unable to find y-value for event x-value " + x.toString())

    const traceY = pair[1]

    return {
        distanceM: x,
        traceY: traceY,
        number: evNum,
        kind: kind
    }
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
                    !Number.isFinite(traceY) ||
                    x < chartArea.left ||
                    x > chartArea.right ||
                    traceY < chartArea.top ||
                    traceY > chartArea.bottom
                ) {
                    continue
                }

                const y = traceY - 22

                ctx.save()
                ctx.lineWidth = 0.75
                ctx.setLineDash([2, 2])
                ctx.beginPath()
                ctx.moveTo(x, y + 10)
                ctx.lineTo(x, traceY)
                ctx.stroke()
                ctx.restore()

                ctx.beginPath()

                switch (event.kind) {
                    case 'reflective':
                        // Vertical double-headed arrow
                        ctx.moveTo(x, y-8)
                        ctx.lineTo(x, y + 8)

                        // Upper arrowhead
                        ctx.moveTo(x - 4, y - 4)
                        ctx.lineTo(x, y - 8)
                        ctx.lineTo(x + 4, y - 4)

                        // Lower arrowhead
                        ctx.moveTo(x - 4, y + 4)
                        ctx.lineTo(x, y + 8)
                        ctx.lineTo(x + 4, y + 4)
                        break
                }

                ctx.stroke()

                ctx.fillText(String(event.number), x, y - 12)
            }

            ctx.restore()
        }
    }
}