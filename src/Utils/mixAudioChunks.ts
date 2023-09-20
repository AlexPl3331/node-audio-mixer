import { AudioMixerArgs } from "../AudioMixer/AudioMixer"

const mixAudioChunks = (chunks: Array<Buffer>, size: number, mixerArgs: AudioMixerArgs): Buffer => {
    const bytesPerSample = mixerArgs.bitDepth / 8;

    const outputMixedChunk = Buffer.alloc(size);

    for (let index = 0; index < size; index += bytesPerSample)
    {
        let mixedSample = chunks.map((chunk) => {
            if (index < chunk.length)
                return chunk[`readInt${mixerArgs.endianness}`](index, bytesPerSample);

            return 0;
        })
            .reduce((sample, nextSample) => sample + nextSample);

        mixedSample /= chunks.length;

        outputMixedChunk[`writeInt${mixerArgs.endianness}`](mixedSample, index, bytesPerSample);
    }

    return outputMixedChunk;
}

export default mixAudioChunks; 