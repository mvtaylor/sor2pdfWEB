import { BinaryReader } from "./binary-reader";

export class SorReader {
    private br: BinaryReader;

    // private mapblock;
    // private genparams;
    // private keyevents;

    constructor(buffer: ArrayBuffer) {
        this.br = new BinaryReader(buffer);
    }

    public parse() {

    }

    public results() {

    }

    public tracedata(): String[] {
        return [];
    }
}