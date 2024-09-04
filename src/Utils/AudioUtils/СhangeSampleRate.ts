import {type InputParams, type MixerParams} from '../../Types/ParamTypes';
import {type IntType, type BitDepth} from '../../Types/AudioTypes';

import {ModifiedDataView} from '../../ModifiedDataView/ModifiedDataView';
import {isLittleEndian} from '../General/IsLittleEndian';
import {getMethodName} from '../General/GetMethodName';

export function changeSampleRate(audioData: ModifiedDataView, inputParams: InputParams, mixerParams: MixerParams): ModifiedDataView {
	const bytesPerElement = inputParams.bitDepth / 8;

	const isLe = isLittleEndian(inputParams.endianness);

	const scaleFactor = inputParams.sampleRate / mixerParams.sampleRate;

	const totalInputSamples = Math.floor(audioData.byteLength / bytesPerElement);
	const totalOutputSamples = Math.ceil(totalInputSamples / scaleFactor);

	const dataSize = totalOutputSamples * bytesPerElement;

	const allocData = new Uint8Array(dataSize);
	const allocDataView = new ModifiedDataView(allocData.buffer);

	const getSampleMethod: `get${IntType}${BitDepth}` = `get${getMethodName(inputParams.bitDepth, inputParams.unsigned)}`;
	const setSampleMethod: `set${IntType}${BitDepth}` = `set${getMethodName(mixerParams.bitDepth, mixerParams.unsigned)}`;

	for (let index = 0; index < totalOutputSamples; index++) {
		const interpolatePosition = index * scaleFactor;

		const previousPosition = Math.floor(interpolatePosition);
		const nextPosition = previousPosition + 1;

		const previousSample = audioData[getSampleMethod](previousPosition * bytesPerElement, isLe);

		const nextSample = nextPosition < totalInputSamples
			? audioData[getSampleMethod](nextPosition * bytesPerElement, isLe)
			: previousSample;

		const interpolatedValue = ((interpolatePosition - previousPosition) * (nextSample - previousSample)) + previousSample;

		allocDataView[setSampleMethod](index * bytesPerElement, interpolatedValue, isLe);
	}

	inputParams.sampleRate = mixerParams.sampleRate;
	inputParams.endianness = mixerParams.endianness;

	return allocDataView;
}
