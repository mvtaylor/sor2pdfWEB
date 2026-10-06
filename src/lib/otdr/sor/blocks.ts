
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
    blockSize: number;
}

export interface MapBlock {
    version: number;
    mapBlockSizeBytes: number;
    numberOfBlocks: number;

    blockSizes: blockSize[];
}

