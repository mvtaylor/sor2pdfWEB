export class BinaryReader {
	private readonly view: DataView;
	private readonly bytes: Uint8Array;
	private cursor = 0;

	constructor(buffer: ArrayBuffer) {
		this.view = new DataView(buffer);
		this.bytes = new Uint8Array(buffer);
	}

	get length(): number {
		return this.bytes.length;
	}

	tell(): number {
		return this.cursor;
	}

	seek(position: number): void {
		this.cursor = position;
	}

	skip(byteCount: number): void {
		this.cursor += byteCount;
	}

	atEnd(): boolean {
		return this.cursor >= this.bytes.length;
	}

	readUint8(): number {
		const value = this.view.getUint8(this.cursor);
		this.cursor += 1;
		return value;
	}

	readInt8(): number {
		const value = this.view.getInt8(this.cursor);
		this.cursor += 1;
		return value;
	}

	readUint16(): number {
		const value = this.view.getUint16(this.cursor, true);
		this.cursor += 2;
		return value;
	}

	readInt16(): number {
		const value = this.view.getInt16(this.cursor, true);
		this.cursor += 2;
		return value;
	}

	readUint32(): number {
		const value = this.view.getUint32(this.cursor, true);
		this.cursor += 4;
		return value;
	}

	readInt32(): number {
		const value = this.view.getInt32(this.cursor, true);
		this.cursor += 4;
		return value;
	}

	readBytes(byteCount: number): Uint8Array {
		const value = this.bytes.subarray(this.cursor, this.cursor + byteCount);
		this.cursor += byteCount;
		return value;
	}

	// SOR text fields are null-terminated ASCII strings.
	readCString(): string {
		const start = this.cursor;
		while (this.cursor < this.bytes.length && this.bytes[this.cursor] !== 0) {
			this.cursor += 1;
		}
		const value = new TextDecoder('ascii').decode(this.bytes.subarray(start, this.cursor));
		this.cursor += 1; // skip the null terminator
		return value;
	}
}

export async function readerFromFile(file: File): Promise<BinaryReader> {
	const buffer = await file.arrayBuffer();
	return new BinaryReader(buffer);
}
