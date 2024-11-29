import {endianness} from 'os';

import {type Endianness, type IntMethodNames} from '../../Types/AudioTypes';
import {type ModifiedDataView} from '../../ModifiedDataView/ModifiedDataView';
import {type InputParams} from '../../Types/ParamTypes';

import {isLittleEndian} from '../General/IsLittleEndian';
import {getMethodName} from '../General/GetMethodName';

export function changeEndianness(audioData: ModifiedDataView, params: InputParams, mixerEndianness: Endianness = endianness()): void {
	const bytesPerElement = params.bitDepth / 8;

	const isInputLe = isLittleEndian(params.endianness);
	const isMixerLe = isLittleEndian(mixerEndianness);

	const getSampleMethod: `get${IntMethodNames}` = `get${getMethodName(params.bitDepth, params.unsigned, params.float)}`;
	const setSampleMethod: `set${IntMethodNames}` = `set${getMethodName(params.bitDepth, params.unsigned, params.float)}`;

	for (let index = 0; index < audioData.byteLength; index += bytesPerElement) {
		const sample = audioData[getSampleMethod](index, isInputLe);

		audioData[setSampleMethod](index, sample, isMixerLe);
	}

	params.endianness = mixerEndianness;
}
