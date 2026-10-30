import type { KeyEventTranslated } from "./otdr/sor/blocks";

export function nearestPoint(points: [number, number][], distance: number | undefined): [number, number] | undefined {
    if (points.length === 0 || distance === undefined) return undefined;

    return points.reduce((best, point) => {
        return Math.abs(point[0] - distance) < Math.abs(best[0] - distance)
            ? point
            : best;
    });
}

/**
 * Like `new Map(Object.entries(keyEvent))` but better
 * @param obj An Object
 * @returns a Map of strings to values; subobjects are inclued as key.subkey
 */
export function unwrapObject(obj: object, prefix: string = ""): Map<string, any> {

    const ret = new Map<String, any>()

    type objKey = keyof typeof obj

    for (const attr in obj) {
        if (typeof attr === "object") {

        } else {
            ret.set(attr, obj[attr as objKey])
        }
    }
}