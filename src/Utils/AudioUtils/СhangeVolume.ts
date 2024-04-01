import {type BitDepth} from '../../Types/AudioTypes';
import {type ModifiedDataView} from '../../ModifiedDataView/ModifiedDataView';
import {type AudioInputParams, type AudioMixerParams} from '../../Types/ParamsTypes';

import {endianness} from 'os';

import {getMethodName} from '../GetMethodName';

export function changeVolume(audioData: ModifiedDataView, params: AudioInputParams | AudioMixerParams): void {
	const bytesPerElement = params.bitDepth / 8;
	const volume = params.volume! / 100;

	const paramEndianness = params.endianness ?? endianness();

	const getSampleMethod: `getInt${BitDepth}` = `get${getMethodName(params.bitDepth)}`;
	const setSampleMethod: `setInt${BitDepth}` = `set${getMethodName(params.bitDepth)}`;

	for (let index = 0; index < audioData.byteLength; index += bytesPerElement) {
		const sample = audioData[getSampleMethod](index, paramEndianness === 'LE');
		const volumedSample = sample * volume;

		audioData[setSampleMethod](index, volumedSample, paramEndianness === 'LE');
	}
}
