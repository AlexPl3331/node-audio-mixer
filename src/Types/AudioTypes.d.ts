type SampleRate = 4000 | 8000 | 11025 | 16000 | 22050 | 24000 | 32000 | 44100 | 48000 | 88200 | 96000 | 176400 | 192000;

type BitDepth = 8 | 16 | 24 | 32;

type Endianness = 'LE' | 'BE';

type IntMethodNames = 'Int8' | 'Int16' | 'Int24' | 'Int32' | 'Uint8' | 'Uint16' | 'Uint24' | 'Uint32' | 'Float32';

export type {
	SampleRate, BitDepth, Endianness, IntMethodNames,
};
