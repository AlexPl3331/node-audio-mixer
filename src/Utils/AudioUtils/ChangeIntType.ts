import {type AudioInputParams, type AudioMixerParams} from '../../Types/ParamTypes';
import {type IntType, type BitDepth} from '../../Types/AudioTypes';
import {type ModifiedDataView} from '../../ModifiedDataView/ModifiedDataView';

import {getMethodName} from '../General/GetMethodName';
import {isLittleEndian} from '../General/IsLittleEndian';

export function changeIntType(audioData: ModifiedDataView, inputParams: AudioInputParams, mixerParams: AudioMixerParams): void {
	const bytesPerElement = inputParams.bitDepth / 8;

	const maxValue = (2 ** (inputParams.bitDepth - 1));

	const isInputLe = isLittleEndian(inputParams.endianness);
	const isMixerLe = isLittleEndian(inputParams.endianness);

	const getSampleMethod: `get${IntType}${BitDepth}` = `get${getMethodName(inputParams.bitDepth, inputParams.unsigned)}`;
	const setSampleMethod: `set${IntType}${BitDepth}` = `set${getMethodName(mixerParams.bitDepth, mixerParams.unsigned)}`;

	for (let index = 0; index < audioData.byteLength; index += bytesPerElement) {
		let sample = audioData[getSampleMethod](index, isInputLe);

		if (mixerParams.unsigned) {
			sample += maxValue;
		} else {
			sample -= maxValue;
		}

		audioData[setSampleMethod](index, sample, isMixerLe);
	}

	inputParams.unsigned = mixerParams.unsigned;
}
