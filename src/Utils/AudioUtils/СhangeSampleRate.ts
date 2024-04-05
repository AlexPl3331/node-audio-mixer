import {type AudioInputParams, type AudioMixerParams} from '../../Types/ParamsTypes';
import {type BitDepth} from '../../Types/AudioTypes';

import {endianness} from 'os';

import {ModifiedDataView} from '../../ModifiedDataView/ModifiedDataView';
import {getMethodName} from '../General/GetMethodName';

export function changeSampleRate(audioData: ModifiedDataView, inputParams: AudioInputParams, mixerParams: AudioMixerParams): ModifiedDataView {
	const bytesPerElement = inputParams.bitDepth / 8;

	const inputEndianness = inputParams.endianness ?? endianness();
	const mixerEndianness = mixerParams.endianness ?? endianness();

	const dataSize = Math.round((audioData.byteLength / bytesPerElement) * (mixerParams.sampleRate / inputParams.sampleRate));

	const allocData = new Int8Array(dataSize * bytesPerElement);
	const allocDataView = new ModifiedDataView(allocData.buffer);

	const getSampleMethod: `getInt${BitDepth}` = `get${getMethodName(inputParams.bitDepth)}`;
	const setSampleMethod: `setInt${BitDepth}` = `set${getMethodName(mixerParams.bitDepth)}`;

	for (let index = 0; index < dataSize; index++) {
		const oldSamplePosition = Math.floor(index * inputParams.sampleRate / mixerParams.sampleRate) * bytesPerElement;
		const sample = audioData[getSampleMethod](oldSamplePosition, inputEndianness === 'LE');

		allocDataView[setSampleMethod](index * bytesPerElement, sample, mixerEndianness === 'LE');
	}

	return allocDataView;
}
