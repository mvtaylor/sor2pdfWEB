
import { Chart, LineController } from "chart.js/auto";
import type { KeyEventsTranslated, TraceDataTranslated } from "./otdr/sor/blocks";
import type { SorReader } from "./otdr/sor-reader";
import { getRelativePosition } from "chart.js/helpers";
import annotationPlugin from "chartjs-plugin-annotation";
import type { AnnotationOptions } from "chartjs-plugin-annotation";
import type { Marker } from "./render-results";


// add:
// tracedata: ([number, number])[], keyEvents: KeyEventsTranslated
export function createChart(canvas: HTMLCanvasElement, sorReader: SorReader, markers: Marker[]): Chart<"line", [number, number][]> {
    Chart.register(LineController);
    Chart.register(annotationPlugin);

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
                },

                plugins: {
                    annotation: {
                        annotations: {},
                    }
                },

                onClick(event, _elements, chart) {
                    const native = event.native;

                    if (markers.length >= 2) return; // only two markers allowed

                    if (!(native instanceof MouseEvent) || !native.shiftKey) {
                        return;
                    }

                    const pos = getRelativePosition(native, chart);
                    const area = chart.chartArea;

                    // Ignore clicks outside the plotting area
                    if (
                        pos.x < area.left || pos.x > area.right ||
                        pos.y < area.top || pos.y > area.bottom
                    ) {
                        return;
                    }

                    const distance = chart.scales.x.getValueForPixel(pos.x);
                    const point = nearestPoint(sorReader.tracedata(), distance);

                    if (!point) return;

                    const number = markers.length + 1;

                    markers.push({
                        id: `marker-${number}`,
                        x: point[0],
                        y: point[1],
                        label: `M${number}`
                    });

                    redrawMarkers(chart, markers);
                }
            }
        },
    )
}

function nearestPoint(points: [number, number][], distance: number | undefined): [number, number] | undefined {
    if (points.length === 0 || distance === undefined) return undefined;

    return points.reduce((best, point) => {
        return Math.abs(point[0] - distance) < Math.abs(best[0] - distance)
            ? point
            : best;
    });
}

function redrawMarkers(chart: Chart, markers: Marker[]): void {
    const annotations: Record<string, AnnotationOptions> = {};

    // console.log(`Top: ${chart.chartArea.top}; bottom: ${chart.chartArea.bottom}`);
    // console.log(`Value of bottom: ${chart.scales.y.getValueForPixel(chart.chartArea.bottom)}`);

    for (const marker of markers) {
        annotations[marker.id] = {
            type: "line",
            xMin: marker.x,
            xMax: marker.x,
            yMin: chart.scales.y.getValueForPixel(chart.chartArea.bottom),
            yMax: chart.scales.y.getValueForPixel(chart.chartArea.top),
            borderColor: "#dc2626",
            borderWidth: 2,
            adjustScaleRange: false,
            drawTime: "afterDatasetsDraw",

            label: {
                display: true,
                content: `${marker.label}: ${marker.x.toFixed(1)} m`,
                position: "end",
                backgroundColor: "#dc2626",
                color: "white",
                font: { size: 10 },
            }
        };
    }

    chart.options.plugins!.annotation!.annotations = annotations;
    chart.update("none");
}

export function clearMarkers(chart: Chart, markers: Marker[]):  void {
    while (markers.length > 0) {
      markers.pop()
    }

    redrawMarkers(chart, markers);
}