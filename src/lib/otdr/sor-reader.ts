import { BinaryReader } from "./binary-reader";
import { ParsedSORFile } from "./sor/sor-file";

export class SorReader {
    private br: BinaryReader;
    private sorfile!: ParsedSORFile;

    // private mapblock;
    // private genparams;
    // private keyevents;

    constructor(buffer: ArrayBuffer) {
        this.br = new BinaryReader(buffer);
    }

    public parse() {
        this.sorfile = new ParsedSORFile(this.br);
    }

    // temporary I think
    public parsedFile() {
        return this.sorfile;
    }

    public results() {
        return new Map(Object.entries({
            language: this.sorfile.translatedBlocks.genParams?.language,
            cableID: this.sorfile.translatedBlocks.genParams?.cableID,
            fiberID: this.sorfile.translatedBlocks.genParams?.fiberID
        }));
    }

    public tracedata(): String[] {
        return [];
    }
}