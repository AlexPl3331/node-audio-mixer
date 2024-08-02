export function assertVolume(volume: number): asserts volume {
	if (volume < 0 || volume > 100) {
		throw new TypeError('Volume range must be from 0 to 100');
	}
}
