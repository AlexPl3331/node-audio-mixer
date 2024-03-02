export function assertChannelsCount(channels: number): asserts channels {
	if (channels <= 0) {
		throw new TypeError('The number of channels must be 1 or more');
	}
}
