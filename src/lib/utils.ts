export function nearestPoint(points: [number, number][], distance: number | undefined): [number, number] | undefined {
    if (points.length === 0 || distance === undefined) return undefined;

    return points.reduce((best, point) => {
        return Math.abs(point[0] - distance) < Math.abs(best[0] - distance)
            ? point
            : best;
    });
}