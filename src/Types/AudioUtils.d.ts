export type AudioUtils = {
	setAudioData(audioData: Int8Array | Int8Array[]): ThisType<AudioUtils>;
	changeVolume(): ThisType<AudioUtils>;
	getAudioData(): ThisType<AudioUtils>;
};
