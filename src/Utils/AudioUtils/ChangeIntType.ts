import {type InputParams} from '../../Types/ParamTypes';
import {type IntMethodNames} from '../../Types/AudioTypes';
import {type ModifiedDataView} from '../../ModifiedDataView/ModifiedDataView';

import {getMethodName} from '../General/GetMethodName';
import {isLittleEndian} from '../General/IsLittleEndian';
import {getValueRange} from '../General/GetValueRange';

export function changeIntType(audioData: ModifiedDataView, params: InputParams, unsigned = false): void {
	const bytesPerElement = params.bitDepth / 8;

	const isLe = isLittleEndian(params.endianness);

	const valueRange = getValueRange(params.bitDepth, false);

	const getSampleMethod: `get${IntMethodNames}` = `get${getMethodName(params.bitDepth, params.unsigned, params.float)}`;
	const setSampleMethod: `set${IntMethodNames}` = `set${getMethodName(params.bitDepth, params.unsigned, params.float)}`;

	for (let index = 0; index < audioData.byteLength; index += bytesPerElement) {
		let sample = audioData[getSampleMethod](index, isLe);

		if (unsigned) {
			sample += valueRange.max + 1;
		} else {
			sample -= valueRange.max + 1;
		}

		audioData[setSampleMethod](index, sample, isLe);
	}

	params.unsigned = unsigned;
}
