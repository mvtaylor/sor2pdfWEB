
import { Chart, LineController } from "chart.js/auto";
import type { KeyEventsTranslated, TraceDataTranslated } from "./otdr/sor/blocks";

// add:
// tracedata: ([number, number])[], keyEvents: KeyEventsTranslated
export async function createChart(canvas: HTMLCanvasElement) {
    Chart.register(LineController);

    new Chart(
        canvas,
        {
            type: "line",
            data: {
                datasets: [{
                    label: "Measurements",
                    data: [[1,3], [2, 4]]
                }]
            },
            options: {
                scales: {
                    x: {
                        type: "linear",
                        title: {
                            display: true,
                            text: "Time (seconds)"
                        }
                    },

                    y: {
                        type: "linear",
                        title: {
                            display: true,
                            text: "Distance"
                        }
                    }
                }
            }
        },
    )
}