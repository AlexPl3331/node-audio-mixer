import {type AudioSampleRate, type AudioBitDepth} from './AudioTypes';

export type DelayTimeType = number | (() => number);
export type PreProcessDataType = (data: Int8Array) => Int8Array;

type BasedParams = {
	sampleRate: AudioSampleRate;
	channels: number;
	bitDepth: AudioBitDepth;
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
