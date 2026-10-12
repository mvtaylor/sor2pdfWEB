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

    private findSpanLength(): number {
        return 0;
    }

    public results() {
        const spanLength_km = this.findSpanLength();

        return {
            generalInformation: {
                language: this.sorfile.translatedBlocks.genParams?.language,
                cableID: this.sorfile.translatedBlocks.genParams?.cableID,
                fiberID: this.sorfile.translatedBlocks.genParams?.fiberID,
                fiberType: this.sorfile.translatedBlocks.genParams?.fiberType,
                wavelengthNominal_nm: this.sorfile.translatedBlocks.genParams?.wavelength,
                comments: this.sorfile.translatedBlocks.genParams?.comments,
                datetime: this.sorfile.translatedBlocks.fxdParams?.datetime
            },
            results: {
                spanLength_km: spanLength_km,   
                spanLoss_dB: 0,
                spanORL_dB: 0,
                averageLoss_dbPerkm: 0,
                averageSpliceLoss_dB: 0,
                maxSpliceLoss_dB: 0
            }
        };
    }

    public tracedata(): [number, number][] {
        return [[1, 2], [3,4]];
    }
}