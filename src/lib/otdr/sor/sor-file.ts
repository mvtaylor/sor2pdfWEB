
import { BinaryReader } from "../binary-reader";
import { blockStarters } from "./blocks";
import type { blockInfo, FxdParamsBlock, GenParamsBlock, KeyEvent, KeyEventsBlock, MapBlock, PulseWidthEntry, SupParamsBlock } from "./blocks";
import { type TranslatedBlocks, type RawBlocks, translateGenParams, translateFxdParams } from "./translation";

export class ParsedSORFile {
    private br: BinaryReader;
    private offsets: Map<string, number>;

    rawBlocks: RawBlocks;
    translatedBlocks: TranslatedBlocks;

    constructor(binaryReader: BinaryReader) {
        this.br = binaryReader;
        this.rawBlocks = {
            mapBlock: null,
            genParams: null,
            supParams: null,
            fxdParams: null
        }
        this.translatedBlocks = {
            mapBlock: null,
            genParams: null,
            supParams: null,
            fxdParams: null
        }
        this.rawBlocks.mapBlock = this.parseMapBlock();
        this.offsets = this.constructOffsets();
        this.rawBlocks.genParams = this.parseGenParams();
        this.rawBlocks.supParams = this.parseSupParams();
        this.rawBlocks.fxdParams = this.parseFxdParams();

        console.log(`${JSON.stringify(this.rawBlocks.mapBlock)}`);
        console.log("==============================================");
        console.log(`${JSON.stringify(Object.fromEntries(this.offsets))}`);
        console.log("==============================================");
        console.log(`${JSON.stringify(this.rawBlocks.genParams)}`);
        console.log("==============================================");
        console.log(JSON.stringify(this.rawBlocks.supParams));
        console.log("==============================================");
        console.log(JSON.stringify(this.rawBlocks.fxdParams));
        
        console.log("=".repeat(100));

        this.translatedBlocks.genParams = translateGenParams(this.rawBlocks.genParams);
        this.translatedBlocks.fxdParams = translateFxdParams(this.rawBlocks.fxdParams);

        console.log(`Translated GenParams:\n${JSON.stringify(this.translatedBlocks.genParams)}`);
        console.log("=".repeat(10));
        console.log(`Translated FxdParams:\n${JSON.stringify(this.translatedBlocks.fxdParams)}`);
    }

    parseMapBlock(): MapBlock {
        this.br.seek(0);
        const mapHeader: string = this.br.readCString();
        if (mapHeader !== "Map") throw new Error("Invalid header on SOR file");

        const vernum = this.br.readUint16();
        const mapBlockSize = this.br.readUint32();
        const numBlocks = this.br.readUint16();

/*         
        const blockSizes: blockInfo[] = blockStarters.slice(1, -1).map((starter) => {
            const blockName = this.br.readCString();
            if (blockName !== starter) {
                console.log(`${blockName} vs. ${starter}`);
                throw new Error("Unexpected block order!");
            }

            const blockVer = this.br.readUint16();
            const blockLen = this.br.readUint32();

            const res: blockInfo = {
                blockName: blockName,
                version: blockVer,
                blockSize: blockLen
            };

            return res;
        });
 */
        // TODO: new way of parsing out all the block infos

        const blockSizesNew = [];
        
        while (this.br.tell() < mapBlockSize) {
            const blockName = this.br.readCString();

            const blockVer = this.br.readUint16();
            const blockLen = this.br.readUint32();

            const newBInfo: blockInfo = {
                blockName: blockName,
                version: blockVer,
                blockSize: blockLen
            };

            blockSizesNew.push(newBInfo);
        }

        const res: MapBlock = {
            version: vernum,
            mapBlockSizeBytes: mapBlockSize,
            numberOfBlocks: numBlocks,

            blockSizes: blockSizesNew
        };

        return res;
    }

    constructOffsets(): Map<string, number> {
        let running = 0;

        let offsets = new Map();

        if (this.rawBlocks.mapBlock === null) throw new Error("Cannot construct offsets yet; map block null");

        this.rawBlocks.mapBlock.blockSizes.forEach((bInfo: blockInfo) => {
            offsets.set(bInfo.blockName, running);
            running += bInfo.blockSize;
        });

        for (const blockKey of offsets.keys()) {
            offsets.set(blockKey, offsets.get(blockKey)! + this.rawBlocks.mapBlock.mapBlockSizeBytes);
        }

        return offsets;
    }

    parseGenParams(): GenParamsBlock {
        const blockStart = this.offsets.get("GenParams");
        if (blockStart === undefined) throw new Error("Unable to get GenParams start byte");
        this.br.seek(blockStart);

        const blockName = this.br.readCString();
        if (blockName !== "GenParams") throw new Error("Error encountered while parsing GenParams: block name is not GenParams");

        const cableID = this.br.readCString();
        const fiberID = this.br.readCString();

        const fiberType = this.br.readUint16();
        const wavelength = this.br.readUint16();

        const locA = this.br.readCString();
        const locB = this.br.readCString();

        const cableCode = this.br.readCString();

        const buildCondition = this.br.readChars(2);

        const userOffset = this.br.readInt32();
        const userOffsetDistance = this.br.readInt32();

        const operator = this.br.readCString();
        const comments = this.br.readCString();

        const genp: GenParamsBlock = {
            cableID: cableID,
            fiberID: fiberID,
            fiberType: fiberType,
            wavelength: wavelength,
            locationA: locA,
            locationB: locB,
            cableCode: cableCode,
            buildCondition: buildCondition,
            userOffset: userOffset,
            userOffsetDistance: userOffsetDistance,
            operator: operator,
            comments: comments
        }

        return genp;
    }

    parseSupParams(): SupParamsBlock {
        const blockStart = this.offsets.get("SupParams");
        if (blockStart === undefined) throw new Error("Unable to get SupParams start byte");
        this.br.seek(blockStart);

        const blockName = this.br.readCString();
        if (blockName !== "SupParams") throw new Error("Error encountered while parsing SupParams: block name is not SupParams");

        const suppName = this.br.readCString();
        const otdrName = this.br.readCString();
        const otdrSN = this.br.readCString();

        const modName = this.br.readCString();
        const modSN = this.br.readCString();

        const softwareVer = this.br.readCString();
        const other = this.br.readCString();
        
        const res: SupParamsBlock = {
            supplierName: suppName,
            otdrName: otdrName,
            otdrSerialNumber: otdrSN,
            moduleName: modName,
            moduleSerialNumber: modSN,
            softwareVersion: softwareVer,
            other: other
        }

        return res;
    }

    parseFxdParams(): FxdParamsBlock {
        const blockStart = this.offsets.get("FxdParams");
        if (blockStart === undefined) throw new Error("Unable to get FxdParams start byte");
        this.br.seek(blockStart);

        const blockName = this.br.readCString();
        if (blockName !== "FxdParams") throw new Error("Error encountered while parsing FxdParams: block name is not FxdParams");

        const datetime = this.br.readUint32();
        const units = this.br.readChars(2);
        const wavelength = this.br.readUint16();
        const acquisitionOffset = this.br.readInt32();
        const acquisitionOffsetDistance = this.br.readInt32();

        const numPulseWidthEntries = this.br.readInt16();

        const pwEntries: PulseWidthEntry[] = [];

        for (let i = 0; i < numPulseWidthEntries; i++) {
            const pulseWidth = this.br.readUint16();
            const sampleSpacing = this.br.readUint32();
            const numDataPts = this.br.readUint32();

            const pwEntry: PulseWidthEntry = {
                pulseWidth: pulseWidth,
                sampleSpacing: sampleSpacing,
                numberDataPointsTrace: numDataPts
            }

            pwEntries.push(pwEntry);
        }

        const ior = this.br.readUint32();

        const backscatteringCoeff = this.br.readUint16();

        const numAvgs = this.br.readUint32();

        const avgingTime = this.br.readUint16();

        const range = this.br.readUint32();

        const acquisitionRangeDistance = this.br.readInt32();
        const frontPanelOffset = this.br.readInt32();

        const noiseFloorLevel = this.br.readInt16(); // not sure if signed/unsigned
        const noiseFloorScalingFactor = this.br.readInt16();

        const powerOffsetFirstPoint = this.br.readInt16(); // not sure if signed/unsigned

        const lossThreshold = this.br.readUint16();
        const reflectionThreshold = this.br.readUint16();
        const endOfTransmissionThreshold = this.br.readUint16();

        const traceType = this.br.readChars(2);

        const x1 = this.br.readInt32();
        const y1 = this.br.readInt32();
        const x2 = this.br.readInt32();
        const y2 = this.br.readInt32();

        const res: FxdParamsBlock = {
            datetime: datetime,
            units: units,
            wavelength: wavelength,
            acquisitionOffset: acquisitionOffset,
            acquisitionOffsetDistance: acquisitionOffsetDistance,
            numberPulseWidthEntries: numPulseWidthEntries,
            pulseWidthEntries: pwEntries,
            indexOfRefraction: ior,
            backscatteringCoeff: backscatteringCoeff,
            numberAverages: numAvgs,
            averagingTime: avgingTime,
            range: range,
            acquisitionRangeDistance: acquisitionRangeDistance,
            frontPanelOffset: frontPanelOffset,
            noiseFloorLevel: noiseFloorLevel,
            noiseFloorScalingFactor: noiseFloorScalingFactor,
            powerOffsetFirstPoint: powerOffsetFirstPoint,
            lossThreshold: lossThreshold,
            reflectionThreshold: reflectionThreshold,
            endOfTransmissionThreshold: endOfTransmissionThreshold,
            traceType: traceType,
            X1: x1,
            Y1: y1,
            X2: x2,
            Y2: y2
        }

        return res;
    }

    parseKeyEvents(): KeyEventsBlock {
        const blockStart = this.offsets.get("KeyEvents");
        if (blockStart === undefined) throw new Error("Unable to get KeyEvents start byte");
        this.br.seek(blockStart);

        const blockName = this.br.readCString();
        if (blockName !== "KeyEvents") throw new Error("Error encountered while parsing KeyEvents: block name is not KeyEvents");

        const numEvents = this.br.readUint16();

        // Get key events

        const allKeyEvents: KeyEvent[] = [];

        for (let i = 0; i < numEvents; i++) {
            const eventNumber = this.br.readUint16();
            const timeOfTravel = this.br.readUint32();
            const slope = this.br.readInt16();
            const spliceLoss = this.br.readInt16();
            const reflectionLoss = this.br.readInt32();
            const eventType = this.br.readChars(8);

            const endOfPreviousEvent = this.br.readUint32();
            const beginningOfCurrentEvent = this.br.readUint32();
            const endOfCurrentEvent = this.br.readUint32();
            const beginningOfNextEvent = this.br.readUint32();
            const peakPointCurrentEvent = this.br.readUint32();
            
            const comments = this.br.readCString();

            const newKeyEvent: KeyEvent = {
                eventNumber: eventNumber,
                timeOfTravel: timeOfTravel,
                slope: slope,
                spliceLoss: spliceLoss,
                reflectionLoss: reflectionLoss,
                eventType: eventType,
                endOfPreviousEvent: endOfPreviousEvent,
                beginningOfCurrentEvent: beginningOfCurrentEvent,
                endOfCurrentEvent: endOfCurrentEvent,
                beginningOfNextEvent: beginningOfNextEvent,
                peakPointCurrentEvent: peakPointCurrentEvent,
                comments: comments
            }

            allKeyEvents.push(newKeyEvent);
        }

        // end

        const totalLoss = this.br.readInt32();
        const fiberStartPos = this.br.readInt32();
        const fiberLen = this.br.readUint32();
        const orl = this.br.readUint16();
        const fiberStartPos2 = this.br.readInt32();
        const fiberLen2 = this.br.readUint32();

        const res: KeyEventsBlock = {
            numberOfEvents: 0,
            keyEvents: allKeyEvents,
            totalLoss: totalLoss,
            fiberStartPosition: fiberStartPos,
            fiberLength: fiberLen,
            opticalReturnLoss: orl,
            fiberStartPosition2: fiberStartPos2,
            fiberLength2: fiberLen2
        }

        return res;
    }
}