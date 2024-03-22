import {type AudioInputParams, type AudioMixerParams} from '../../Types/ParamsTypes';
import {type BitDepth} from '../../Types/AudioTypes';

import {endianness} from 'os';

import {ModifiedDataView} from '../../ModifiedDataView/ModifiedDataView';
import {getMethodName} from '../GetMethodName';

export function changeBitDepth(audioData: ModifiedDataView, inputParams: AudioInputParams, mixerParams: AudioMixerParams): ModifiedDataView {
	const oldBytesPerElement = inputParams.bitDepth / 8;
	const newBytesPerElement = mixerParams.bitDepth / 8;
	const scalingFactor = 2 ** (mixerParams.bitDepth - inputParams.bitDepth);

	const inputEndianness = inputParams.endianness ?? endianness();
	const mixerEndianness = mixerParams.endianness ?? endianness();

	const dataSize = audioData.byteLength * (mixerParams.bitDepth / inputParams.bitDepth);

	const allocData = new Int8Array(dataSize);
	const allocDataView = new ModifiedDataView(allocData.buffer);

	const getSampleMethod: `getInt${BitDepth}` = `get${getMethodName(inputParams.bitDepth)}`;
	const setSampleMethod: `setInt${BitDepth}` = `set${getMethodName(mixerParams.bitDepth)}`;

	for (let index = 0; index < audioData.byteLength; index += oldBytesPerElement) {
		const audioSample = audioData[getSampleMethod](index, inputEndianness === 'LE');
		const scaledSample = Math.round(audioSample * scalingFactor);

		const newSamplePosition = Math.round(index * (newBytesPerElement / oldBytesPerElement));

		allocDataView[setSampleMethod](newSamplePosition, scaledSample, mixerEndianness === 'LE');
	}

	return allocDataView;
}
