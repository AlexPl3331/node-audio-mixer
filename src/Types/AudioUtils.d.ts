export type AudioUtils = {
	setAudioData(audioData: Int8Array | Int8Array[]): ThisType<AudioUtils>;
	checkVolume(): ThisType<AudioUtils>;
	getAudioData(): Int8Array;
};
