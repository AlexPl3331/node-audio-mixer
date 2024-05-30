import {type IntType, type BitDepth} from '../../Types/AudioTypes';
import {type AudioInputParams, type AudioMixerParams} from '../../Types/ParamTypes';

import {ModifiedDataView} from '../../ModifiedDataView/ModifiedDataView';
import {isLittleEndian} from './IsLittleEndian';
import {getValueRange} from './GetValueRange';
import {getMethodName} from './GetMethodName';

export function mixAudioData(audioData: ModifiedDataView[], params: AudioInputParams | AudioMixerParams): ModifiedDataView {
	const bytesPerElement = params.bitDepth / 8;

	const valueRange = getValueRange(params.bitDepth, params.unsigned);
	const maxSigned = 2 ** (params.bitDepth - 1);

	const isLe = isLittleEndian(params.endianness);

	const newData = new Uint8Array(audioData[0].byteLength);
	const mixedData = new ModifiedDataView(newData.buffer);

	const getSampleMethod: `get${IntType}${BitDepth}` = `get${getMethodName(params.bitDepth, params.unsigned)}`;
	const setSampleMethod: `set${IntType}${BitDepth}` = `set${getMethodName(params.bitDepth, params.unsigned)}`;

	for (let index = 0; index < newData.length; index += bytesPerElement) {
		const samples = audioData.map(data => data[getSampleMethod](index, isLe));

		const mixSample = samples.reduce((sample, nextSample) => sample + nextSample, params.unsigned ? -maxSigned : 0);
		const clipSample = Math.min(Math.max(mixSample, valueRange.min), valueRange.max);

		mixedData[setSampleMethod](index, clipSample, isLe);
	}

	return mixedData;
}
