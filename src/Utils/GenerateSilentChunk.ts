import { AudioSampleRate } from "../Types/AudioTypes";


const generateSilentChunk = (sampleRate: AudioSampleRate, channels: number, size: number | null) => {
    const chunkSize: number = size ?? (sampleRate * channels) * 2;
    const silentChunk: Buffer = Buffer.alloc(chunkSize);

    return silentChunk;
}

export default generateSilentChunk;