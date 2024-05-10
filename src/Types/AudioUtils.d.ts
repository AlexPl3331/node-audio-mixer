export type AudioUtils = {
	setAudioData(audioData: Uint8Array | Uint8Array[]): ThisType<AudioUtils>;
	checkVolume(): ThisType<AudioUtils>;
	getAudioData(): Uint8Array;
};
