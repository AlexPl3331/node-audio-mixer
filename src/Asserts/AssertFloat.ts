import {type BitDepth} from '../Types/AudioTypes';

export function assertFloat(bitDepth: BitDepth, unsigned?: boolean) {
	if (bitDepth !== 32) {
		throw new TypeError('The "float" parameter can only be used for 32-bit');
	}

	if (unsigned) {
		throw new TypeError('The "unsigned" parameter cannot be used with "float"');
	}
}
