const generateSilentChunk = (size: number) => {
    const chunkSize: number = size;
    const silentChunk: Buffer = Buffer.alloc(chunkSize);

    return silentChunk;
}

export default generateSilentChunk;