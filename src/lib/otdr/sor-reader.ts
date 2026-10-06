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

    public results() {

    }

    public tracedata(): String[] {
        return [];
    }
}