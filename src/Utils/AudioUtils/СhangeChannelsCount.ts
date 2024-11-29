
import {type InputParams} from '../../Types/ParamTypes';
import {type IntMethodNames} from '../../Types/AudioTypes';

import {ModifiedDataView} from '../../ModifiedDataView/ModifiedDataView';
import {isLittleEndian} from '../General/IsLittleEndian';
import {getMethodName} from '../General/GetMethodName';

export function changeChannelsCount(audioData: ModifiedDataView, params: InputParams, channels: number): ModifiedDataView {
	const bytesPerElement = params.bitDepth / 8;

	const isLe = isLittleEndian(params.endianness);

	const dataSize = Math.round((audioData.byteLength / params.channels) * channels);

	const allocData = new Uint8Array(dataSize);
	const allocDataView = new ModifiedDataView(allocData.buffer);

	const getSampleMethod: `get${IntMethodNames}` = `get${getMethodName(params.bitDepth, params.unsigned, params.float)}`;
	const setSampleMethod: `set${IntMethodNames}` = `set${getMethodName(params.bitDepth, params.unsigned, params.float)}`;

	for (let oldPosition = 0, newPosition = 0; oldPosition < audioData.byteLength; oldPosition += (bytesPerElement * params.channels)) {
		const sample = audioData[getSampleMethod](oldPosition, isLe);

		const nextPosition = newPosition + (bytesPerElement * channels);

		for (newPosition; newPosition < nextPosition; newPosition += bytesPerElement) {
			allocDataView[setSampleMethod](newPosition, sample, isLe);
		}
	}

	params.channels = channels;

	return allocDataView;
}
