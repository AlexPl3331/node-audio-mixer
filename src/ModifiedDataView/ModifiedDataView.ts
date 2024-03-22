/* eslint-disable no-bitwise */
type Int24Byte = [number, number, number];

export class ModifiedDataView extends DataView {
	public getInt24(byteOffset: number, littleEndian?: boolean): number {
		const int24Byte = this.getByte(byteOffset, littleEndian);

		return (int24Byte[0] << 16) | (int24Byte[1] << 8) | int24Byte[2];
	}

	public getUint24(byteOffset: number, littleEndian?: boolean): number {
		const int24Byte = this.getByte(byteOffset, littleEndian, true);

		return (int24Byte[0] << 16) | (int24Byte[1] << 8) | int24Byte[2];
	}

	public setInt24(byteOffset: number, value: number, littleEndian?: boolean): void {
		this.setByte(byteOffset, value, littleEndian);
	}

	public setUint24(byteOffset: number, value: number, littleEndian?: boolean): void {
		this.setByte(byteOffset, value, littleEndian, true);
	}

	private getByte(byteOffset: number, littleEndian?: boolean, isUnsigned?: boolean): Int24Byte {
		let bytes: Int24Byte;

		const methodName: 'getInt8' | 'getUint8' = isUnsigned ? 'getUint8' : 'getInt8';

		bytes = [this[methodName](byteOffset), this[methodName](byteOffset + 1), this[methodName](byteOffset + 2)];

		if (!littleEndian) {
			bytes = bytes.reverse() as Int24Byte;
		}

		return bytes;
	}

	private setByte(byteOffset: number, value: number, littleEndian?: boolean, isUnsigned?: boolean): void {
		let bytes: Int24Byte = [value & 0xff, (value >> 8) & 0xff, (value >> 16) & 0xff];

		if (!littleEndian) {
			bytes = bytes.reverse() as Int24Byte;
		}

		const methodName: 'setInt8' | 'setUint8' = isUnsigned ? 'setUint8' : 'setInt8';

		this[methodName](byteOffset, bytes[0]);
		this[methodName](byteOffset + 1, bytes[1]);
		this[methodName](byteOffset + 2, bytes[2]);
	}
}
