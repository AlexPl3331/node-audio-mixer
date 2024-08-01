export function assertHighWaterMark(bitDepth: number, highWaterMark?: number): asserts highWaterMark {
	const bytesPerElement = bitDepth / 8;

	if (typeof highWaterMark === 'number') {
		if (highWaterMark % bytesPerElement !== 0) {
			throw new TypeError('highWaterMark must be a multiple of the byte size derived from bitDepth');
		}
	}
}
