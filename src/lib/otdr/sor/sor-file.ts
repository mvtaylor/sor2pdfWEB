
import type { BinaryReader } from "../binary-reader";
import { blockStarters } from "./blocks";
import type { blockInfo, MapBlock } from "./blocks";

export class ParsedSORFile {
    private br: BinaryReader;
    mapBlock: MapBlock;

    constructor(binaryReader: BinaryReader) {
        this.br = binaryReader;
        this.mapBlock = this.parseMapBlock();

        console.log(`${this.mapBlock}`);
    }

    parseMapBlock(): MapBlock {
        const mapHeader: string = this.br.readCString();
        if (mapHeader !== "Map") throw Error("Invalid header on SOR file");

        const vernum = this.br.readUint16();
        const mapBlockSize = this.br.readUint32();
        const numBlocks = this.br.readUint16();

        const blockSizes: blockInfo[] = blockStarters.slice(1).map((starter) => {
            const blockName = this.br.readCString();
            if (blockName !== starter) throw Error("Unexpected block order!");

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
}