import {type InputParams} from '../../Types/ParamTypes';
import {type IntType, type BitDepth} from '../../Types/AudioTypes';
import {type ModifiedDataView} from '../../ModifiedDataView/ModifiedDataView';

import {getMethodName} from '../General/GetMethodName';
import {isLittleEndian} from '../General/IsLittleEndian';
import {getValueRange} from '../General/GetValueRange';

export function changeIntType(audioData: ModifiedDataView, params: InputParams, unsigned?: boolean): void {
	const bytesPerElement = params.bitDepth / 8;

	const isLe = isLittleEndian(params.endianness);

	const valueRange = getValueRange(params.bitDepth, params.unsigned);

	const getSampleMethod: `get${IntType}${BitDepth}` = `get${getMethodName(params.bitDepth, params.unsigned)}`;
	const setSampleMethod: `set${IntType}${BitDepth}` = `set${getMethodName(params.bitDepth, unsigned)}`;

	for (let index = 0; index < audioData.byteLength; index += bytesPerElement) {
		let sample = audioData[getSampleMethod](index, isLe);

		if (unsigned) {
			sample += valueRange.max;
		} else {
			sample -= valueRange.max;
		}

		audioData[setSampleMethod](index, sample, isLe);
	}

	params.unsigned = unsigned;
}
