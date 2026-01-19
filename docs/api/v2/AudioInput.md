## Class: AudioInput
Represents a class that receives audio frames and
gives them to [AudioMixer](./AudioMixer.md#class-audiomixer) when [AudioInput.getData](#audioinputgetdata) is called.

Extends `Writable`.

### new AudioInput(inputParams, mixerParams, removeFunction?)
Creates a new `AudioInput` instance.

- `inputParams` {[InputParams](../../../src/Types/ParamTypes.ts#L25)} `InputParams` configuration.
  - `sampleRate` {[SampleRate](../../../src/Types/AudioTypes.ts#L1)} Input sample rate.
  - `channels` {Number} Number of input channels.
  - `bitDepth` {[BitDepth](../../../src/Types/AudioTypes.ts#L3)} Input bit depth.
  - `endianness` {[Endianness](../../../src/Types/AudioTypes.ts#L5)} Input endianness. Default: `The endianness of your CPU`.
  - `unsigned` {Boolean | undefined} Input audio is unsigned or not.
  - `float` {Boolean | undefined} Input audio is float or not. Cannot be enabled with `unsigned`.
  - `volume` {Number | undefined} Input volume.
  - `preProcessData` {Function | undefined} Processes the audio frame before it's be stored in the `AudioInput`.
  - `name` {String} Sets a name for the `AudioInput`. Default: `input-n`.
  - `forceClose` {Boolean | undefined} Closes the `AudioInput` and discards all audio frames from buffer.
  - `correctByteSize` {Boolean | undefined}  Corrects audio frame size if it's not aligned to [BitDepth](../../../src/Types/AudioTypes.ts#L3).
- `mixerParams` {[MixerParams](../../../src/Types/ParamTypes.ts#L17)} `AudioMixer` params.
- `selfRemoveFunction` {Function} Function to remove `AudioInput` from the `AudioMixer`.

**Example:**
```typescript
const firstInput = mixer.createAudioInput({
	 sampleRate: 48000,
	 channles: 1,
	 bitDepth: 16,
});

// Or you can create a standalone AudioInput
const secondInput = new AudioInput(
	{
		sampleRate: 48000,
		channels: 1,
		bitDepth: 16,
		volume: 90,
	},
	{
		sampleRate: 48000,
		channels: 1,
		bitDepth: 16,
		volume: 90,
	},
);
```

### AudioInput.params
Reading returns an immutable [InputParams](../../../src/Types/ParamTypes.ts#L25) object.
Assigning updates the [AudioInput](#class-audioinput) params.

**Example:**
```typescript
// read params from input
console.log(firstInput.params); // { sampleRate: 48000, channels: 1, bitDepth: 16, endianness: "LE" }

// Assign new params to the firstInput
firstInput.params = {
	volume: 50,
	forceClose: true,
};

// Read it again
console.log(firstInput.params); // { sampleRate: 48000, channels: 1, bitDepth: 16, endianness: "LE" volume: 50, forceClose: true }
```

### AudioInput.dataSize 
Returns the buffer size.

**Returns:** {Number} Buffer size.

**Example:**
```typescript
console.log(firstInput.dataSize);
```

### AudioInput.getData()
Returns an audio frame with a given size.

- `size` {Number} Audio frame size.

**Returns:** {Uint8Array} An audio frame with given size.

**Example:**
```typescript
console.log(firstInput.getData());
```

### AudioInput.destroy()
Removes itself from [AudioMixer](./AudioMixer.md#class-audiomixer) if the buffer is empty or `forceClose` is set.

**Example:**
```typescript
firstInput.destroy();
```
