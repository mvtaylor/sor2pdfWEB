
import { Chart, LineController } from "chart.js/auto";
import type { KeyEventsTranslated, TraceDataTranslated } from "./otdr/sor/blocks";
import type { SorReader } from "./otdr/sor-reader";

// add:
// tracedata: ([number, number])[], keyEvents: KeyEventsTranslated
export async function createChart(canvas: HTMLCanvasElement, sorReader: SorReader) {
    Chart.register(LineController);

    return new Chart(
        canvas,
        {
            type: "line",
            data: {
                datasets: [{
                    label: "Measurements",
                    data: sorReader.tracedata()
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
                            text: "Attenuation (dB)"
                        }
                    }
                }
            }
        },
    )
}