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

    const ret = new Map<string, any>()

    type objKey = keyof typeof obj

    for (const attr in obj) {
        const val = obj[attr as objKey]
        if (typeof val === "object") {
            const subvals = unwrapObject(val, attr + ".")
            subvals.forEach((v, k) => ret.set(k, v))
        } else {
            ret.set(prefix + attr, val)
        }
    }

    // console.log("unwrapObject: " + JSON.stringify(Object.fromEntries(ret)))
    return ret
}

export function filterAndSortMap(map: Map<string, any>, includeKeys: string[]): Map<string, any> {
    const newmap = new Map()

    for (const key of includeKeys) {
        const val = map.get(key)
        if (val === undefined) continue
        newmap.set(key, val)
    }

    return newmap
}