import {type SampleRate, type BitDepth, type Endianness} from './AudioTypes';

export type DelayTimeType = number | (() => number);
export type PreProcessDataType = (data: Uint8Array) => Uint8Array;

type BasedParams = {
	sampleRate: SampleRate;
	channels: number;
	bitDepth: BitDepth;
	volume?: number;
	endianness?: Endianness;
	forceClose?: boolean;
	preProcessData?: PreProcessDataType;
};

export type AudioMixerParams = {
	highWaterMark?: number;
	generateSilent?: boolean;
	silentDuration?: number;
	delayTime?: DelayTimeType;
} & BasedParams;

export type AudioInputParams = {
	fillChunk?: boolean;
} & BasedParams;

export type OmitAudioParams<T> = Omit<T, 'sampleRate' | 'channels' | 'bitDepth'>;
