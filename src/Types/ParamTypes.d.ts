import {type SampleRate, type BitDepth, type Endianness} from './AudioTypes';

type DelayTimeType = number | (() => number);
type PreProcessDataFunc = (data: Uint8Array) => Uint8Array;

type BasedParams = {
	sampleRate: SampleRate;
	channels: number;
	bitDepth: BitDepth;
	unsigned?: boolean;
	volume?: number;
	endianness?: Endianness;
	forceClose?: boolean;
	preProcessData?: PreProcessDataFunc;
};

export type AudioMixerParams = {
	highWaterMark?: number;
	generateSilence?: boolean;
	silentDuration?: number;
	delayTime?: DelayTimeType;
} & BasedParams;

export type AudioInputParams = {
	fillChunk?: boolean;
} & BasedParams;

export type OmitAudioParams<T> = Omit<T, 'sampleRate' | 'channels' | 'bitDepth'>;
