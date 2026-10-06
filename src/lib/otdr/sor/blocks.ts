
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


export interface SupParamsBlock {
    supplierName: string;
    otdrName: string;
    otdrSerialNumber: string;
    moduleName: string;
    moduleSerialNumber: string;
    softwareVersion: string;
    other: string;
}


interface PulseWidthEntry {
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
    ioc: number;
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