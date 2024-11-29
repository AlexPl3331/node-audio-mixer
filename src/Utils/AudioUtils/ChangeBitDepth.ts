
import {type InputParams, type MixerParams} from '../../Types/ParamTypes';
import {type IntMethodNames} from '../../Types/AudioTypes';

import {ModifiedDataView} from '../../ModifiedDataView/ModifiedDataView';
import {isLittleEndian} from '../General/IsLittleEndian';
import {getMethodName} from '../General/GetMethodName';
import {getScaledSample} from '../General/GetScaledSample';

export function changeBitDepth(audioData: ModifiedDataView, inputParams: InputParams, mixerParams: MixerParams): ModifiedDataView {
	const oldBytesPerElement = inputParams.bitDepth / 8;
	const newBytesPerElement = mixerParams.bitDepth / 8;

	const scalingFactor = 2 ** (mixerParams.bitDepth - inputParams.bitDepth);

	const isLe = isLittleEndian(inputParams.endianness);

	const dataSize = audioData.byteLength * (mixerParams.bitDepth / inputParams.bitDepth);

	const allocData = new Uint8Array(dataSize);
	const allocDataView = new ModifiedDataView(allocData.buffer);

	const getSampleMethod: `get${IntMethodNames}` = `get${getMethodName(inputParams.bitDepth, inputParams.unsigned, inputParams.float)}`;
	const setSampleMethod: `set${IntMethodNames}` = `set${getMethodName(mixerParams.bitDepth, mixerParams.unsigned, mixerParams.float)}`;

	for (let index = 0; index < audioData.byteLength; index += oldBytesPerElement) {
		const audioSample = audioData[getSampleMethod](index, isLe);

		const scaledSample = getScaledSample(audioSample, scalingFactor, inputParams, mixerParams);
		const newSamplePosition = Math.floor(index * (newBytesPerElement / oldBytesPerElement));

		allocDataView[setSampleMethod](newSamplePosition, scaledSample, isLe);
	}

	inputParams.bitDepth = mixerParams.bitDepth;

	return allocDataView;
}
