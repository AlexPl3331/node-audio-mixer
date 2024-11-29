import {type InputParams, type MixerParams} from '../../Types/ParamTypes';
import {type ModifiedDataView} from '../../ModifiedDataView/ModifiedDataView';
import {type IntMethodNames} from '../../Types/AudioTypes';

import {isLittleEndian} from '../General/IsLittleEndian';
import {getMethodName} from '../General/GetMethodName';
import {getValueRange} from '../General/GetValueRange';

export function changeVolume(audioData: ModifiedDataView, params: InputParams | MixerParams): void {
	const bytesPerElement = params.bitDepth / 8;
	const volume = params.volume! / 100;

	const isLe = isLittleEndian(params.endianness);

	const valueRange = getValueRange(params.bitDepth, false, params.float);

	const getSampleMethod: `get${IntMethodNames}` = `get${getMethodName(params.bitDepth, params.unsigned, params.float)}`;
	const setSampleMethod: `set${IntMethodNames}` = `set${getMethodName(params.bitDepth, params.unsigned, params.float)}`;

	for (let index = 0; index < audioData.byteLength; index += bytesPerElement) {
		const sample = audioData[getSampleMethod](index, isLe);

		const volumedSample = params.unsigned
			? ((sample - valueRange.max) * volume) + valueRange.max
			: sample * volume;

		audioData[setSampleMethod](index, volumedSample, isLe);
	}

	params.volume = 100;
}
