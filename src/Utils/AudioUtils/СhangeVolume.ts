import {type InputParams, type MixerParams} from '../../Types/ParamTypes';
import {type ModifiedDataView} from '../../ModifiedDataView/ModifiedDataView';
import {type IntType, type BitDepth} from '../../Types/AudioTypes';

import {isLittleEndian} from '../General/IsLittleEndian';
import {getMethodName} from '../General/GetMethodName';

export function changeVolume(audioData: ModifiedDataView, params: InputParams | MixerParams): void {
	const bytesPerElement = params.bitDepth / 8;
	const volume = params.volume! / 100;

	const isLe = isLittleEndian(params.endianness);

	const getSampleMethod: `get${IntType}${BitDepth}` = `get${getMethodName(params.bitDepth, params.unsigned)}`;
	const setSampleMethod: `set${IntType}${BitDepth}` = `set${getMethodName(params.bitDepth, params.unsigned)}`;

	for (let index = 0; index < audioData.byteLength; index += bytesPerElement) {
		const sample = audioData[getSampleMethod](index, isLe);
		const volumedSample = sample * volume;

		audioData[setSampleMethod](index, volumedSample, isLe);
	}

	params.volume = 100;
}
