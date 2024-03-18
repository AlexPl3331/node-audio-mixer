import {type SampleRate, type BitDepth, type Endianness} from './AudioTypes';

export type DelayTimeType = number | (() => number);
export type PreProcessDataType = (data: Int8Array) => Int8Array;

type BasedParams = {
	sampleRate: SampleRate;
	channels: number;
	bitDepth: BitDepth;
	endianness?: Endianness;
	volume?: number;
	preProcessData?: PreProcessDataType;
};

export type AudioMixerParams = {
	highWaterMark?: number;
	generateSilent?: boolean;
	silentDuration?: number;
	delayTime?: DelayTimeType;
	closeOnEnd?: boolean;
} & BasedParams;

export type AudioInputParams = {
	fillChunk?: boolean;
	closeForce?: boolean;
} & BasedParams;

export type OmitAudioParams<T> = Omit<T, 'sampleRate' | 'channels' | 'bitDepth'>;
