
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
        if (mapHeader !== "Map") throw Error("Invalid header on SOR file");

        const vernum = this.br.readUint16();
        const mapBlockSize = this.br.readUint32();
        const numBlocks = this.br.readUint16();

        const blockSizes: blockInfo[] = blockStarters.slice(1, -1).map((starter) => {
            const blockName = this.br.readCString();
            if (blockName !== starter) {
                console.log(`${blockName} vs. ${starter}`);
                throw Error("Unexpected block order!");
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

        const res = {
            version: vernum,
            mapBlockSizeBytes: mapBlockSize,
            numberOfBlocks: numBlocks,

            blockSizes: blockSizes
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
        //throw new Error("not implemented");
    }
}