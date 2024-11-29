import {type BitDepth} from '../../Types/AudioTypes';

type RangeValue = {min: number; max: number};

export function getValueRange(bitDepth: BitDepth, isUnsigned?: boolean, isFloat?: boolean): RangeValue {
	const maxValue = isFloat ? 1.0 : (2 ** (isUnsigned ? bitDepth : bitDepth - 1)) - 1;
	const minValue = isFloat ? -1.0 : isUnsigned ? 0 : -(maxValue + 1);

	return {min: minValue, max: maxValue};
}
