import { AudioMixerArgs } from "../AudioMixer/AudioMixer"

const mixAudioChunks = (chunks: Array<Buffer>, size: number, mixerArgs: AudioMixerArgs): Buffer => {
    const bytesPerSample = mixerArgs.bitDepth / 8;

    const outputMixedChunk = Buffer.alloc(size);

    for (let index = 0; index < size; index += bytesPerSample)
    {
        let mixedSample: number = chunks.map((chunk) => chunk[`readInt${mixerArgs.endianness}`](index, bytesPerSample))
            .reduce((sample, nextSample) => sample + nextSample);

        mixedSample /= chunks.length;

        outputMixedChunk[`writeInt${mixerArgs.endianness}`](mixedSample, index, bytesPerSample);
    }

    return outputMixedChunk;
}

export default mixAudioChunks; 