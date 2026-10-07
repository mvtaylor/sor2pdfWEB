
import { BinaryReader } from "../binary-reader";
import { blockStarters } from "./blocks";
import type { blockInfo, GenParamsBlock, MapBlock } from "./blocks";

export class ParsedSORFile {
    private br: BinaryReader;
    private offsets: Map<string, number>;

    mapBlock: MapBlock;
    generalParamsBlock: GenParamsBlock;

    constructor(binaryReader: BinaryReader) {
        this.br = binaryReader;
        this.mapBlock = this.parseMapBlock();
        this.offsets = this.constructOffsets();
        this.generalParamsBlock = this.parseGenParams();

        console.log(`${JSON.stringify(this.mapBlock)}`);
        console.log("==============================================");
        console.log(`${JSON.stringify(Object.fromEntries(this.offsets))}`);
        console.log("==============================================");
        console.log(`${JSON.stringify(this.generalParamsBlock)}`);
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

        this.mapBlock.blockSizes.forEach((bInfo: blockInfo) => {
            offsets.set(bInfo.blockName, running);
            running += bInfo.blockSize;
        });

        for (const blockKey of offsets.keys()) {
            offsets.set(blockKey, offsets.get(blockKey)! + this.mapBlock.mapBlockSizeBytes);
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
}