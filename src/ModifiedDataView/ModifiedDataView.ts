/* eslint-disable no-bitwise */
export class ModifiedDataView extends DataView<ArrayBufferLike> {
	public getInt24(byteOffset: number, littleEndian?: boolean): number {
		const byte = this.getByte(byteOffset, littleEndian);

		return (byte << 8) >> 8;
	}

	public getUint24(byteOffset: number, littleEndian?: boolean): number {
		return this.getByte(byteOffset, littleEndian);
	}

	public setInt24(byteOffset: number, value: number, littleEndian?: boolean): void {
		this.setByte(byteOffset, value, littleEndian);
	}

	public setUint24(byteOffset: number, value: number, littleEndian?: boolean): void {
		this.setByte(byteOffset, value, littleEndian, true);
	}

	private getByte(byteOffset: number, littleEndian?: boolean): number {
		const bytes: number[] = [
			this.getUint8(byteOffset),
			this.getUint8(byteOffset + 1),
			this.getUint8(byteOffset + 2),
		];

		if (littleEndian) {
			bytes.reverse();
		}

		return (bytes[0] << 16) | (bytes[1] << 8) | bytes[2];
	}

	private setByte(byteOffset: number, value: number, littleEndian?: boolean, isUnsigned?: boolean): void {
		const bytes: number[] = [
			(value >> 16),
			(value >> 8),
			value,
		];

		if (littleEndian) {
			bytes.reverse();
		}

		const methodName: 'setInt8' | 'setUint8' = isUnsigned ? 'setUint8' : 'setInt8';

		this[methodName](byteOffset, bytes[0]);
		this[methodName](byteOffset + 1, bytes[1]);
		this[methodName](byteOffset + 2, bytes[2]);
	}
}
