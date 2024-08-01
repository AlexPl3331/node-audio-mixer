import {type IntType, type BitDepth} from '../../Types/AudioTypes';
import {type InputParams, type MixerParams} from '../../Types/ParamTypes';

import {ModifiedDataView} from '../../ModifiedDataView/ModifiedDataView';
import {isLittleEndian} from './IsLittleEndian';
import {getValueRange} from './GetValueRange';
import {getMethodName} from './GetMethodName';
import {getZeroSample} from './GetZeroSample';

export function mixAudioData(audioData: ModifiedDataView[], params: InputParams | MixerParams): ModifiedDataView {
	const bytesPerElement = params.bitDepth / 8;

	const valueRange = getValueRange(params.bitDepth, params.unsigned);
	const zeroSample = getZeroSample(params.bitDepth, params.unsigned);

	const isLe = isLittleEndian(params.endianness);

	const newData = new Uint8Array(audioData[0].byteLength);
	const mixedData = new ModifiedDataView(newData.buffer);

	const getSampleMethod: `get${IntType}${BitDepth}` = `get${getMethodName(params.bitDepth, params.unsigned)}`;
	const setSampleMethod: `set${IntType}${BitDepth}` = `set${getMethodName(params.bitDepth, params.unsigned)}`;

	for (let index = 0; index < newData.length; index += bytesPerElement) {
		const samples = audioData.map(data => data[getSampleMethod](index, isLe));

		const mixSample = samples.reduce((sample, nextSample) => sample + nextSample, zeroSample);

		const clipSample = Math.min(Math.max(mixSample, valueRange.min), valueRange.max);

		mixedData[setSampleMethod](index, clipSample, isLe);
	}

	return mixedData;
}
