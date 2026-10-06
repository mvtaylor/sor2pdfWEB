
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

interface blockSize {
    blockName: blockName;
    version: number;
    blockSize: number;
}

export interface MapBlock {
    version: number;
    mapBlockSizeBytes: number;
    numberOfBlocks: number;

    blockSizes: blockSize[];
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



