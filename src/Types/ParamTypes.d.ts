import {type SampleRate, type BitDepth, type Endianness} from './AudioTypes';

type DelayTimeType = number | (() => number);
type PreProcessDataFunction = (data: Uint8Array) => Uint8Array;

type BasedParams = {
	sampleRate: SampleRate;
	channels: number;
	bitDepth: BitDepth;
	endianness?: Endianness;
	unsigned?: boolean;
	volume?: number;
	autoClose?: boolean;
	preProcessData?: PreProcessDataFunction;
};

export type MixerParams = {
	highWaterMark?: number;
	generateSilence?: boolean;
	silentDuration?: number;
	delayTime?: DelayTimeType;
} & BasedParams;

export type InputParams = {
	correctByteSize?: boolean;
} & BasedParams;

export type OmitSomeParams<T> = Omit<T, 'sampleRate' | 'channels' | 'bitDepth'>;
