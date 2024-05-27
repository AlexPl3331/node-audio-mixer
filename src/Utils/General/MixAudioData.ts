import {type BitDepth} from '../../Types/AudioTypes';
import {type AudioInputParams, type AudioMixerParams} from '../../Types/ParamsTypes';

import {ModifiedDataView} from '../../ModifiedDataView/ModifiedDataView';
import {isLittleEndian} from './IsLittleEndian';
import {getMethodName} from './GetMethodName';

export function mixAudioData(audioData: ModifiedDataView[], params: AudioInputParams | AudioMixerParams): ModifiedDataView {
	const bytesPerElement = params.bitDepth / 8;

	const maxValue = (2 ** (params.bitDepth - 1)) - 1;
	const minValue = -(maxValue + 1);

	const isLe = isLittleEndian(params.endianness);

	const newData = new Uint8Array(audioData[0].byteLength);
	const mixedData = new ModifiedDataView(newData.buffer);

	const getSampleMethod: `getInt${BitDepth}` = `get${getMethodName(params.bitDepth)}`;
	const setSampleMethod: `setInt${BitDepth}` = `set${getMethodName(params.bitDepth)}`;

	for (let index = 0; index < audioData.length; index += bytesPerElement) {
		const samples = audioData.map(data => data[getSampleMethod](index, isLe));

		const mixedSample = samples.reduce((sample, nextSample) => sample + nextSample, 0);
		const clipSample = Math.min(Math.max(mixedSample, minValue), maxValue);

		mixedData[setSampleMethod](index, clipSample, isLe);
	}

	return mixedData;
}
