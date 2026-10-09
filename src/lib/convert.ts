
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
                labels: [1, 2],
                datasets: [{
                    data: [[1,3], [2, 4]]
                }]
            }
        }
    )
}