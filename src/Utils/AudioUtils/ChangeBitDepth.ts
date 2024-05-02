
import {type AudioInputParams, type AudioMixerParams} from '../../Types/ParamsTypes';
import {type BitDepth} from '../../Types/AudioTypes';

import {ModifiedDataView} from '../../ModifiedDataView/ModifiedDataView';
import {isLittleEndian} from '../General/IsLittleEndian';
import {getMethodName} from '../General/GetMethodName';

export function changeBitDepth(audioData: ModifiedDataView, inputParams: AudioInputParams, mixerParams: AudioMixerParams): ModifiedDataView {
	const oldBytesPerElement = inputParams.bitDepth / 8;
	const newBytesPerElement = mixerParams.bitDepth / 8;
	const scalingFactor = 2 ** (mixerParams.bitDepth - inputParams.bitDepth);

	const isInputLe = isLittleEndian(inputParams.endianness);
	const isMixerLe = isLittleEndian(inputParams.endianness);

	const dataSize = audioData.byteLength * (mixerParams.bitDepth / inputParams.bitDepth);

	const allocData = new Int8Array(dataSize);
	const allocDataView = new ModifiedDataView(allocData.buffer);

	const getSampleMethod: `getInt${BitDepth}` = `get${getMethodName(inputParams.bitDepth)}`;
	const setSampleMethod: `setInt${BitDepth}` = `set${getMethodName(mixerParams.bitDepth)}`;

	for (let index = 0; index < audioData.byteLength; index += oldBytesPerElement) {
		const audioSample = audioData[getSampleMethod](index, isInputLe);
		const scaledSample = Math.floor(audioSample * scalingFactor);

		const newSamplePosition = Math.floor(index * (newBytesPerElement / oldBytesPerElement));

		allocDataView[setSampleMethod](newSamplePosition, scaledSample, isMixerLe);
	}

	return allocDataView;
}
