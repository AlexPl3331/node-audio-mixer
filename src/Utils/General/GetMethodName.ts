import {type IntMethodNames, type BitDepth} from '../../Types/AudioTypes';

import {assertFloat} from '../../Asserts/AssertFloat';

export function getMethodName(bitDepth: BitDepth, unsigned?: boolean, float?: boolean): IntMethodNames {
	if (float) {
		assertFloat(bitDepth);

		return 'Float32';
	}

	return `${unsigned ? 'Uint' : 'Int'}${bitDepth}`;
}
