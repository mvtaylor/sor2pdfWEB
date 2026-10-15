
import { Chart, LineController } from "chart.js/auto";
import type { KeyEventsTranslated, TraceDataTranslated } from "./otdr/sor/blocks";
import type { SorReader } from "./otdr/sor-reader";

// add:
// tracedata: ([number, number])[], keyEvents: KeyEventsTranslated
export function createChart(canvas: HTMLCanvasElement, sorReader: SorReader): Chart<"line", [number, number][]> {
    Chart.register(LineController);

    return new Chart(
        canvas,
        {
            type: "line",
            data: {
                datasets: [{
                    label: "Measurements",
                    data: sorReader.tracedata(),
                    borderWidth: 0.5,
                    pointRadius: 0,
                    tension: 0
                }]
            },
            options: {
                scales: {
                    x: {
                        type: "linear",
                        title: {
                            display: true,
                            text: "Distance (m)"
                        }
                    },

                    y: {
                        type: "linear",
                        title: {
                            display: true,
                            text: "Optical level (dB)"
                        }
                    }
                }
            }
        },
    )
}