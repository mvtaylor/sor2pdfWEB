
export const blockStarters: String[] = ["Map", "GenParams", "SupParams", "FxdParams", "KeyEvents", "DataPts", "Cksum"]

enum blockName {
    Map = "Map",
    GenParams = "GenParams",
    SupParams = "SupParams",
    FxdParams = "FxdParams",
    KeyEvents = "KeyEvents",
    DataPts = "DataPts",
    Cksum = "Cksum"
}

export interface blockInfo {
    blockName: string;
    version: number;
    blockSize: number;
}

export interface MapBlock {
    version: number;
    mapBlockSizeBytes: number;
    numberOfBlocks: number;

    blockSizes: blockInfo[];
}


export interface GenParamsBlock {
    language: string;
    cableID: string;
    fiberID: string;
    fiberType: number;
    wavelength: number;
    locationA: string;
    locationB: string;
    cableCode: string;
    buildCondition: string;
    userOffset: number;
    userOffsetDistance: number;
    operator: string;
    comments: string; 
}

export interface GenParamsTranslated {
    language: string;
    cableID: string;
    fiberID: string;
    fiberType: string; // SMF/MMF/etc.
    wavelength: number;
    locationA: string;
    locationB: string;
    cableCode: string;
    buildCondition: string;
    userOffset: number;
    userOffsetDistance: number;
    operator: string;
    comments: string; 
}


export interface SupParamsBlock {
    supplierName: string;
    otdrName: string;
    otdrSerialNumber: string;
    moduleName: string;
    moduleSerialNumber: string;
    softwareVersion: string;
    other: string;
}

export interface SupParamsTranslated {
    supplierName: string;
    otdrName: string;
    otdrSerialNumber: string;
    moduleName: string;
    moduleSerialNumber: string;
    softwareVersion: string;
    other: string;
}


export interface PulseWidthEntry {
    pulseWidth: number; // in ns
    sampleSpacing: number; // in 0.01 ps
    numberDataPointsTrace: number;
}

export interface FxdParamsBlock {
    datetime: number;
    units: string;
    wavelength: number;
    acquisitionOffset: number;
    acquisitionOffsetDistance: number;
    numberPulseWidthEntries: number;
    pulseWidthEntries: PulseWidthEntry[];
    indexOfRefraction: number;
    backscatteringCoeff: number;
    numberAverages: number;
    averagingTime: number;
    range: number;
    acquisitionRangeDistance: number;
    frontPanelOffset: number;
    noiseFloorLevel: number;
    noiseFloorScalingFactor: number;
    powerOffsetFirstPoint: number;
    lossThreshold: number;
    reflectionThreshold: number;
    endOfTransmissionThreshold: number;
    traceType: string;
    X1: number;
    Y1: number;
    X2: number;
    Y2: number;
}

export interface PulseWidthEntryTranslated {
    pulseWidth: number; // in ns
    sampleSpacing: number; // in 0.01 ps
    sampleSpacing_m: number; // in meters
    numberDataPointsTrace: number;
}

export interface FxdParamsTranslated {
    datetime: Date;
    units: string;
    wavelength_nm: number;
    acquisitionOffset: number;
    acquisitionOffsetDistance: number;
    numberPulseWidthEntries: number;
    pulseWidthEntries: PulseWidthEntryTranslated[];
    indexOfRefraction: number;
    backscatteringCoeff_dB: number;
    numberAverages: number;
    averagingTime_s: number;
    range_km: number;
    acquisitionRangeDistance: number;
    frontPanelOffset: number;
    noiseFloorLevel: number;
    noiseFloorScalingFactor: number;
    powerOffsetFirstPoint: number;
    lossThreshold_dB: number;
    reflectionThreshold_dB: number;
    endOfTransmissionThreshold_dB: number;
    traceType: string;
    X1: number;
    Y1: number;
    X2: number;
    Y2: number;
}


export interface KeyEvent {
    eventNumber: number; // starting from 1
    timeOfTravel: number; // units of 0.1 ns
    slope: number; // dB/km
    spliceLoss: number; // dB
    reflectionLoss: number; // dB
    eventType: string; // form nx9999LS
    endOfPreviousEvent: number; // time-of-travel in units of 0.1 ns
    beginningOfCurrentEvent: number; // time-of-travel in units of 0.1 ns
    endOfCurrentEvent: number; // time-of-travel in units of 0.1 ns
    beginningOfNextEvent: number; // time-of-travel in units of 0.1 ns; equals range if last event
    peakPointCurrentEvent: number;
    comments: string;
}


export interface KeyEventsBlock {
    numberOfEvents: number;
    keyEvents: KeyEvent[];

    totalLoss: number; // in units of 0.001 dB
    fiberStartPosition: number; // distance in units of 0.1 ns
    fiberLength: number; // distance in units of 0.1 ns
    opticalReturnLoss: number; // in units of 0.001 dB
    fiberStartPosition2: number; // usually a repeat
    fiberLength2: number; // usually a repeat
}


export interface KeyEventTranslated {
    eventNumber: number; // starting from 1
    timeOfTravel_m: number; // units of meters
    slope_dBPerkm: number; // dB/km
    spliceLoss_dB: number; // dB
    reflectionLoss_dB: number; // dB
    eventType: string; // form nx9999LS OR others
    endOfPreviousEvent_m: number; // time-of-travel in units of meters
    beginningOfCurrentEvent_m: number; // time-of-travel in units of meters
    endOfCurrentEvent_m: number; // time-of-travel in units of meters
    beginningOfNextEvent_m: number; // time-of-travel in units of meters; equals range if last event
    peakPointCurrentEvent_m: number; // time-of-travel etc.
    comments: string;
}


export interface KeyEventsTranslated {
    numberOfEvents: number;
    keyEvents: KeyEventTranslated[];

    totalLoss: number; // in units of dB
    fiberStartPosition: number; // distance in units of meters
    fiberLength: number; // distance in units of meters
    opticalReturnLoss: number; // in units of dB
    fiberStartPosition2: number; // usually a repeat
    fiberLength2: number; // usually a repeat
}


export interface TraceData {
    numberDataPointsInTrace: number;
    scalingFactor: number; // almost always 1000

    dataPoints: number[]; // to get dB, multiply by (-1)*(scalingFactor)*(10^-6) 
}

export interface DataPtsBlock {
    numberDataPoints: number;
    numberTraces: number;
    
    traces: TraceData[];
}


export interface DataPointTranslated {
    distance_m: number;
    opticLevel_dB: number;
}

export interface TraceDataTranslated {
    numberDataPointsInTrace: number;

    dataPointPairs: DataPointTranslated[];
}

export interface DataPtsTranslated {
    numberDataPoints: number;
    numberTraces: number;

    traces: TraceDataTranslated[];
}