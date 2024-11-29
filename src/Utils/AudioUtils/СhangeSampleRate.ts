import {type InputParams} from '../../Types/ParamTypes';
import {type SampleRate, type IntMethodNames} from '../../Types/AudioTypes';

import {ModifiedDataView} from '../../ModifiedDataView/ModifiedDataView';
import {isLittleEndian} from '../General/IsLittleEndian';
import {getMethodName} from '../General/GetMethodName';

export function changeSampleRate(audioData: ModifiedDataView, params: InputParams, sampleRate: SampleRate): ModifiedDataView {
	const bytesPerElement = params.bitDepth / 8;

	const isLe = isLittleEndian(params.endianness);

	const scaleFactor = params.sampleRate / sampleRate;

	const totalInputSamples = Math.floor(audioData.byteLength / bytesPerElement);
	const totalOutputSamples = Math.ceil(totalInputSamples / scaleFactor);

	const dataSize = totalOutputSamples * bytesPerElement;

	const allocData = new Uint8Array(dataSize);
	const allocDataView = new ModifiedDataView(allocData.buffer);

	const getSampleMethod: `get${IntMethodNames}` = `get${getMethodName(params.bitDepth, params.unsigned, params.float)}`;
	const setSampleMethod: `set${IntMethodNames}` = `set${getMethodName(params.bitDepth, params.unsigned, params.float)}`;

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

	params.sampleRate = sampleRate;

	return allocDataView;
}
