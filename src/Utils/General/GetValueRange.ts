import {type BitDepth} from '../../Types/AudioTypes';

type RangeValue = {min: number; max: number};

export function getValueRange(bitDepth: BitDepth, isUnsigned?: boolean): RangeValue {
	const maxValue = (2 ** (isUnsigned ? bitDepth : bitDepth - 1)) - 1;
	const minValue = isUnsigned ? 0 : -(maxValue + 1);

	return {min: minValue, max: maxValue};
}
