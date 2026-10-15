import { BinaryReader } from "./binary-reader";
import type { KeyEventTranslated } from "./sor/blocks";
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
                spanLoss_dB: this.sorfile.translatedBlocks.keyEvents?.totalLoss,
                spanORL_dB: this.sorfile.translatedBlocks.keyEvents?.opticalReturnLoss,
                averageSlope_dbPerkm: this.findAvgSlope(),
                averageSpliceLoss_dB: this.findAvgSpliceLoss(),
                maxSpliceLoss_dB: this.findMaxSpliceLoss()
            }
        };
    }

    public tracedata(): [number, number][] {
        const firstTrace = this.sorfile.translatedBlocks.dataPts?.traces[0];
        if (firstTrace === undefined) throw new Error("At least one trace required!");

        return firstTrace.dataPointPairs.map(dPoint => {
            return [dPoint.distance_m, dPoint.opticLevel_dB];
        });
    }

    public findSpanLength(): number | string {
        const reflEvents = this.reflectiveEvents().toSorted((a, b) => {
            return a.reflectionLoss_dB - b.reflectionLoss_dB;
        });

        if (reflEvents.length === 0) {
            const newRes = this.sorfile.translatedBlocks.keyEvents?.keyEvents.at(-1)?.timeOfTravel_m;
            if (newRes === undefined) {
                return "<ill defined>";
            }
            return newRes;
        } else {
            return reflEvents.reverse()[0].timeOfTravel_m;
        }
    }

    public nonReflectiveEvents(): KeyEventTranslated[] {
        let res = this.sorfile.translatedBlocks.keyEvents?.keyEvents.filter((keyEvent) => {
            return keyEvent.eventType === "non-reflective";
        });

        if (res === undefined) {
            return [];
        } else {
            return res;
        }
    }

    public reflectiveEvents(): KeyEventTranslated[] {
        let res = this.sorfile.translatedBlocks.keyEvents?.keyEvents.filter((keyEvent) => {
            return keyEvent.eventType === "reflective";
        });

        if (res === undefined) {
            return [];
        } else {
            return res;
        }
    }

    public findMaxSpliceLoss(): number | string {
        const events = this.nonReflectiveEvents().toSorted((a, b) => {
            return a.spliceLoss_dB - b.spliceLoss_dB;
        }).toReversed();

        if (events === undefined || events.length === 0) {
            console.log(`Non reflective events: \n${JSON.stringify(this.nonReflectiveEvents())}`)
            return "<ill defined>";
        }

        return events[0].spliceLoss_dB;
    }

    public findAvgSpliceLoss(): number | string {
        const events = this.nonReflectiveEvents();
        
        let total = 0;
        let n = 0;
        for (let i = 0; i < events.length; i++) {
            total += events[i].spliceLoss_dB;
            n += 1;
        }

        return total/n;
    }

    public findAvgSlope(): number | string {
        const events = this.nonReflectiveEvents();
        
        let total = 0;
        let n = 0;
        for (let i = 0; i < events.length; i++) {
            total += events[i].slope_dBPerkm;
            n += 1;
        }

        return total/n;
    }
}