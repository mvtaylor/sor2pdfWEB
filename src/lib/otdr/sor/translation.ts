import type {MapBlock, GenParamsBlock, GenParamsTranslated, SupParamsBlock, SupParamsTranslated, FxdParamsBlock, FxdParamsTranslated, PulseWidthEntryTranslated, KeyEventsBlock, DataPtsBlock, DataPtsTranslated, TraceData, TraceDataTranslated, DataPointTranslated, KeyEventsTranslated, KeyEvent, KeyEventTranslated} from "./blocks";

export interface RawBlocks {
    mapBlock: MapBlock | null;
    genParams: GenParamsBlock | null;
    supParams: SupParamsBlock | null;
    fxdParams: FxdParamsBlock | null;
    keyEvents: KeyEventsBlock | null;
    dataPts: DataPtsBlock | null;
}

export interface TranslatedBlocks {
    mapBlock: MapBlock | null;
    genParams: GenParamsTranslated | null;
    supParams: SupParamsTranslated | null;
    fxdParams: FxdParamsTranslated | null;
    dataPts: DataPtsTranslated | null;
}

export const fiberTypes = new Map(Object.entries({
    651: "ITU-T G.651 (multi-mode fiber)",
    652: "ITU-T G.652 (standard single-mode fiber)",
    653: "ITU-T G.653 (dispersion-shifted fiber)",
    654: "ITU-T G.654 (1550nm loss-minimzed fiber)",
    655: "ITU-T G.655 (nonzero dispersion-shifted fiber)"
}));


export const buildConditions = new Map(Object.entries({
    "BC": "as-built",
    "CC": "as-current",
    "RC": "as-repaired",
    "OT": "other"
}));

export const traceUnitsAbbrev = new Map(Object.entries({
    "km": "km",
    "mt": "m",
    "ft": "ft",
    "kf": "kft",
    "mi": "mi"
}));

export const traceUnitsExpanded = new Map(Object.entries({
    "km": "kilometers",
    "mt": "meters",
    "ft": "feet",
    "kf": "kilo-feet",
    "mi": "miles"    
}));

export const traceTypes = new Map(Object.entries({
    "ST": "standard trace",
    "RT": "reverse trace",
    "DT": "difference trace",
    "RF": "reference"
}));

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
        return iorInt/(10**5); // temporary
    }

    static backscatteringCoefficient(backScatterInt: number): number {
        // returns in units of dB
        return backScatterInt * (-0.1);
    }

    static rangeKM(rangeInt: number): number {
        return rangeInt*(2*10**-5);
    }

    static lossThresholdDB(lossThresholdInt: number): number {
        return lossThresholdInt * 0.001;
    }

    static eotThresholdDB(eotThresholdInt: number): number {
        return eotThresholdInt * 0.001;
    }

    static reflectionThresholdDB(reflectionThresholdInt: number): number {
        return reflectionThresholdInt * -0.001;
    }

    static sampleSpacingM(sampleSpacingInt: number, ior: number): number {
        // Input is in units of 0.01 ps
        // Return units of meters
        // dist = time * c/IOR
        
        // We first convert the sample spacing from units of 0.01 ps to microseconds (us) by multiplying by 10^-8
        // then multiply by the speed of light, c, in units of m/us
        // then divide by the IOR
        return sampleSpacingInt * c0/ior * (10**-8);
    }

    static timeOfTravelM(timeOfTravel_100psInt: number, ior: number): number {
        return timeOfTravel_100psInt*(10**-4)*c0/ior
    }
}

export function translateGenParams(rawGenP: GenParamsBlock): GenParamsTranslated {
    let fiberTypeString = fiberTypes.get(rawGenP.fiberType.toString());
    if (fiberTypeString === undefined) {
        fiberTypeString = rawGenP.fiberType.toString();
    }

    let buildConditionString = buildConditions.get(rawGenP.buildCondition);
    if (buildConditionString !== undefined) {
        buildConditionString = `${rawGenP.buildCondition} (${buildConditionString})`;
    } else {
        buildConditionString = rawGenP.buildCondition;
    }

    
    const res: GenParamsTranslated = {
        cableID: rawGenP.cableID,
        fiberID: rawGenP.fiberID,
        fiberType: fiberTypeString, // TODO: put in actual value
        wavelength: rawGenP.wavelength,
        locationA: rawGenP.locationA,
        locationB: rawGenP.locationB,
        cableCode: rawGenP.cableCode,
        buildCondition: buildConditionString,
        userOffset: rawGenP.userOffset,
        userOffsetDistance: rawGenP.userOffsetDistance,
        operator: rawGenP.operator,
        comments: rawGenP.comments
    }

    return res;
}

export function translateFxdParams(rawFxdP: FxdParamsBlock): FxdParamsTranslated {
    const dt: Date = TranslationFunctions.datetime(rawFxdP.datetime);

    const unitsFull = traceUnitsExpanded.get(rawFxdP.units);
    let units = rawFxdP.units;
    if (unitsFull !== undefined) {
        units = `${units} (${unitsFull})`;
    }

    const wavelength = TranslationFunctions.wavelength(rawFxdP.wavelength);

    const ior = TranslationFunctions.indexOfRefraction(rawFxdP.indexOfRefraction);

    const backscatteringCoeff = TranslationFunctions.backscatteringCoefficient(rawFxdP.backscatteringCoeff);

    const range_km = TranslationFunctions.rangeKM(rawFxdP.range);

    const lossThreshold_dB = TranslationFunctions.lossThresholdDB(rawFxdP.lossThreshold);
    const reflectionThreshold_dB = TranslationFunctions.reflectionThresholdDB(rawFxdP.reflectionThreshold);
    const endOfTransmissionThreshold_dB = TranslationFunctions.eotThresholdDB(rawFxdP.endOfTransmissionThreshold);

    let traceTypeExpanded = traceTypes.get(rawFxdP.traceType);
    if (traceTypeExpanded === undefined) {
        traceTypeExpanded = rawFxdP.traceType;
    }

    const translatedPWEntries: PulseWidthEntryTranslated[] = [];

    for (let i = 0; i < rawFxdP.pulseWidthEntries.length; i++) {
        const pwEntry = rawFxdP.pulseWidthEntries[i];

        const translatedPWEntry: PulseWidthEntryTranslated = {
            pulseWidth: pwEntry.pulseWidth,
            sampleSpacing: pwEntry.sampleSpacing,
            sampleSpacing_m: TranslationFunctions.sampleSpacingM(pwEntry.sampleSpacing, ior),
            numberDataPointsTrace: pwEntry.numberDataPointsTrace
        }

        translatedPWEntries.push(translatedPWEntry);
    }

    const res: FxdParamsTranslated = {
        datetime: dt,
        units: units,
        wavelength_nm: wavelength,
        acquisitionOffset: rawFxdP.acquisitionOffset,
        acquisitionOffsetDistance: rawFxdP.acquisitionOffsetDistance,
        numberPulseWidthEntries: rawFxdP.numberPulseWidthEntries,
        pulseWidthEntries: translatedPWEntries,
        indexOfRefraction: ior,
        backscatteringCoeff_dB: backscatteringCoeff,
        numberAverages: rawFxdP.numberAverages,
        averagingTime_s: rawFxdP.averagingTime,
        range_km: range_km,
        acquisitionRangeDistance: rawFxdP.acquisitionRangeDistance,
        frontPanelOffset: rawFxdP.frontPanelOffset,
        noiseFloorLevel: rawFxdP.noiseFloorLevel,
        noiseFloorScalingFactor: rawFxdP.noiseFloorScalingFactor,
        powerOffsetFirstPoint: rawFxdP.powerOffsetFirstPoint,
        lossThreshold_dB: lossThreshold_dB,
        reflectionThreshold_dB: reflectionThreshold_dB,
        endOfTransmissionThreshold_dB: endOfTransmissionThreshold_dB,
        traceType: traceTypeExpanded,
        X1: rawFxdP.X1,
        Y1: rawFxdP.Y1,
        X2: rawFxdP.X2,
        Y2: rawFxdP.Y2
    }

    return res;
}

function decodeEventType(eventType: string): string {
    return ""; // TODO: placeholder
}


function translateKeyEvent(keyEvent: KeyEvent, ior: number): KeyEventTranslated {

    
    const res: KeyEventTranslated = {
        eventNumber: keyEvent.eventNumber,
        timeOfTravel: TranslationFunctions.timeOfTravelM(keyEvent.timeOfTravel, ior),
        slope: keyEvent.slope * 0.001,
        spliceLoss: keyEvent.spliceLoss * 0.001,
        reflectionLoss: keyEvent.reflectionLoss * 0.001,
        eventType: decodeEventType(keyEvent.eventType),
        endOfPreviousEvent: TranslationFunctions.timeOfTravelM(keyEvent.endOfPreviousEvent, ior),
        beginningOfCurrentEvent: TranslationFunctions.timeOfTravelM(keyEvent.beginningOfCurrentEvent, ior),
        endOfCurrentEvent: TranslationFunctions.timeOfTravelM(keyEvent.endOfCurrentEvent, ior),
        beginningOfNextEvent: TranslationFunctions.timeOfTravelM(keyEvent.beginningOfNextEvent, ior),
        peakPointCurrentEvent: TranslationFunctions.timeOfTravelM(keyEvent.peakPointCurrentEvent, ior),
        comments: keyEvent.comments
    }

    return res;
}


export function translateKeyEvents(rawKeyEvents: KeyEventsBlock, trFxdParams: FxdParamsTranslated): KeyEventsTranslated {

    const fiberStartPos = TranslationFunctions.timeOfTravelM(rawKeyEvents.fiberStartPosition, trFxdParams.indexOfRefraction);
    const fiberLen = TranslationFunctions.timeOfTravelM(rawKeyEvents.fiberLength, trFxdParams.indexOfRefraction);

    const fiberStartPos2 = TranslationFunctions.timeOfTravelM(rawKeyEvents.fiberStartPosition2, trFxdParams.indexOfRefraction);
    const fiberLen2 = TranslationFunctions.timeOfTravelM(rawKeyEvents.fiberLength2, trFxdParams.indexOfRefraction);

    const trKeyEvents: KeyEventTranslated[] = [];

    for (let i = 0; i < rawKeyEvents.keyEvents.length; i++) {
        const trKE = translateKeyEvent(rawKeyEvents.keyEvents[i], trFxdParams.indexOfRefraction);
        trKeyEvents.push(trKE);
    }
    
    const res: KeyEventsTranslated = {
        numberOfEvents: rawKeyEvents.numberOfEvents,
        keyEvents: trKeyEvents,
        totalLoss: rawKeyEvents.totalLoss * 0.001,
        fiberStartPosition: fiberStartPos,
        fiberLength: fiberLen,
        opticalReturnLoss: rawKeyEvents.opticalReturnLoss * 0.001,
        fiberStartPosition2: fiberStartPos2,
        fiberLength2: fiberLen2
    }

    return res;
}


function translateTraceData(traceData: TraceData, sampleSpacing_m: number): TraceDataTranslated {
    const dtpts: DataPointTranslated[] = [];

    for (let i = 0; i < traceData.dataPoints.length; i++) {
        const x = i*sampleSpacing_m;
        
        const rawReading = traceData.dataPoints[i];

        const y = rawReading*(-traceData.scalingFactor)*(10**-6);

        const newPt: DataPointTranslated = {
            distance_m: x,
            attenuation_dB: y
        }

        dtpts.push(newPt);
    }

    const res: TraceDataTranslated = {
        numberDataPointsInTrace: traceData.numberDataPointsInTrace,
        dataPointPairs: dtpts
    }

    return res;
}

export function translateDataPts(rawDataPts: DataPtsBlock, trFxdParams: FxdParamsTranslated): DataPtsTranslated {

    const trTData: TraceDataTranslated[] = [];

    for (let i = 0; i < rawDataPts.traces.length; i++) {
        const sampleSpacing_m = trFxdParams.pulseWidthEntries[i].sampleSpacing_m;
        trTData.push(translateTraceData(rawDataPts.traces[i], sampleSpacing_m));
    }

    const res: DataPtsTranslated = {
        numberDataPoints: rawDataPts.numberDataPoints,
        numberTraces: rawDataPts.numberTraces,
        traces: trTData
    }

    return res;
}