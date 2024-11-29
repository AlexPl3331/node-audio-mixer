import {type InputParams, type MixerParams} from '../../Types/ParamTypes';

import {getValueRange} from './GetValueRange';

export function getScaledSample(value: number, scalingFactor: number, inputParams: InputParams, mixerParams: MixerParams): number {
	if (inputParams.float ?? mixerParams.float) {
		if (inputParams.float && mixerParams.float) {
			return value;
		}

		if (mixerParams.float) {
			const valueRange = getValueRange(inputParams.bitDepth, false);

			return value / (valueRange.max + 1);
		}

		if (inputParams.float) {
			const valueRange = getValueRange(mixerParams.bitDepth, false);

			return value * (valueRange.max + 1);
		}
	}

	return Math.floor(value * scalingFactor);
}
