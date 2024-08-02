import {type BitDepth} from '../../Types/AudioTypes';

export function getZeroSample(bitDepth: BitDepth, unsigned?: boolean): number {
	const maxSigned = 2 ** (bitDepth - 1);

	return unsigned ? -maxSigned : 0;
}
