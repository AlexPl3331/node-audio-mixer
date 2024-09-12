import {type SampleRate, type BitDepth, type Endianness} from './AudioTypes';

type DelayTimeType = number | (() => number);
type PreProcessFunction = (data: Uint8Array) => Uint8Array;

type BasedParams = {
	sampleRate: SampleRate;
	channels: number;
	bitDepth: BitDepth;
	endianness?: Endianness;
	unsigned?: boolean;
	volume?: number;
	preProcessData?: PreProcessFunction;
};

export type MixerParams = {
	autoClose?: boolean;
	highWaterMark?: number;
	generateSilence?: boolean;
	silentDuration?: number;
	delayTime?: DelayTimeType;
} & BasedParams;

export type InputParams = {
	forceClose?: boolean;
	correctByteSize?: boolean;
} & BasedParams;

export type OmitSomeParams<T> = Omit<T, 'sampleRate' | 'channels' | 'bitDepth'>;
