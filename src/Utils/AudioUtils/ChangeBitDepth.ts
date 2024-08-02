
import {type InputParams, type MixerParams} from '../../Types/ParamTypes';
import {type IntType, type BitDepth} from '../../Types/AudioTypes';

import {ModifiedDataView} from '../../ModifiedDataView/ModifiedDataView';
import {isLittleEndian} from '../General/IsLittleEndian';
import {getMethodName} from '../General/GetMethodName';

export function changeBitDepth(audioData: ModifiedDataView, inputParams: InputParams, mixerParams: MixerParams): ModifiedDataView {
	const oldBytesPerElement = inputParams.bitDepth / 8;
	const newBytesPerElement = mixerParams.bitDepth / 8;

	const scalingFactor = 2 ** (mixerParams.bitDepth - inputParams.bitDepth);
	const maxValue = 2 ** (mixerParams.bitDepth - 1);

	const isInputLe = isLittleEndian(inputParams.endianness);
	const isMixerLe = isLittleEndian(inputParams.endianness);

	const dataSize = audioData.byteLength * (mixerParams.bitDepth / inputParams.bitDepth);

	const allocData = new Uint8Array(dataSize);
	const allocDataView = new ModifiedDataView(allocData.buffer);

	const getSampleMethod: `get${IntType}${BitDepth}` = `get${getMethodName(inputParams.bitDepth, inputParams.unsigned)}`;
	const setSampleMethod: `set${IntType}${BitDepth}` = `set${getMethodName(mixerParams.bitDepth, mixerParams.unsigned)}`;

	for (let index = 0; index < audioData.byteLength; index += oldBytesPerElement) {
		const audioSample = audioData[getSampleMethod](index, isInputLe);

		let scaledSample = Math.floor(audioSample * scalingFactor);

		if (inputParams.unsigned) {
			scaledSample -= maxValue;
		}

		const newSamplePosition = Math.floor(index * (newBytesPerElement / oldBytesPerElement));

		allocDataView[setSampleMethod](newSamplePosition, scaledSample, isMixerLe);
	}

	inputParams.bitDepth = mixerParams.bitDepth;
	inputParams.endianness = mixerParams.endianness;

	return allocDataView;
}
