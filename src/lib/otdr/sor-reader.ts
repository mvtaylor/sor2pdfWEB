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
                spanLength_km: ["Span length (km)", spanLength_km],   
                spanLoss_dB: ["Span loss (dB)",0],
                spanORL_dB: ["Span ORL (dB)" ,0],
                averageLoss_dbPerkm: ["Average loss (dB/km)", 0],
                averageSpliceLoss_dB: ["Average splice loss (dB)", 0],
                maxSpliceLoss_dB: ["Maximum splice loss (dB)", 0]
            }
        };
    }

    public tracedata(): String[] {
        return [];
    }
}