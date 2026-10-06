export const fiberTypes = {
    651: "ITU-T G.651 (multi-mode fiber)",
    652: "ITU-T G.652 (standard single-mode fiber)",
    653: "ITU-T G.653 (dispersion-shifted fiber)",
    654: "ITU-T G.654 (1550nm loss-minimzed fiber)",
    655: "ITU-T G.655 (nonzero dispersion-shifted fiber)"
};


export const buildConditions = {
    "BC": "as-built",
    "CC": "as-current",
    "RC": "as-repaired",
    "OT": "other"
}

export const traceUnitsAbbrev = {
    "km": "km",
    "mt": "m",
    "ft": "ft",
    "kf": "kft",
    "mi": "mi"
}

export const traceUnitsExpanded = {
    "km": "kilometers",
    "mt": "meters",
    "ft": "feet",
    "kf": "kilo-feet",
    "mi": "miles"    
}

export const c0 = 299.792458; // in m/us

export class TranslationFunctions {
    static wavelength(wavelengthInt: number): number {
        return wavelengthInt/10;
    }

    static datetime(datetimeInt: number): Date {
        return new Date(datetimeInt);
    }

    static sampleSpacingMeters(sampleSpacingTime: number, iorInt: number): number {
        // Sample spacing time is in units of 0.01 ps
        // Convert to microseconds (us) by multiplying by by 10^-8, since 0.01 ps = 10^-8 us
        // then multiply by the speed of light in the medium, which is c0/n, n being the index of refraction; c0 being the speed of light in m/us
        return (sampleSpacingTime/(10**8)) * c0/(this.indexOfRefraction(iorInt));
    }

    static indexOfRefraction(iorInt: number): number {
        return 0; // temporary
    }
}