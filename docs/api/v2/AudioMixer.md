## Class: AudioMixer
Represents a class that gathers audio frames from all [AudioInput](AudioInput.md#class-audioinput)
and mixes them up into one audio frame with specified params.

Extends `Readable`.

### new AudioMixer(mixerParams)
Creates a new `AudioMixer` instance.

- `params` {[MixerParams](../../../src/Types/ParamTypes.ts#L17)} `MixerParams` configuration.
  - `sampleRate` {[SampleRate](../../../src/Types/AudioTypes.ts#L1)} Output sample rate.
  - `channels` {Number} Number of output channels.
  - `bitDepth` {[BitDepth](../../../src/Types/AudioTypes.ts#L3)} Output bit depth.
  - `endianness` {[Endianness](../../../src/Types/AudioTypes.ts#L5)} Output endianness. Default: `The endianness of your CPU`.
  - `unsigned` {Boolean | undefined} Output audio must be unsigned or not.
  - `float` {Boolean | undefined} Output audio must be float or not. Cannot be enabled with `unsigned`.
  - `volume` {Number | undefined} Output volume.
  - `preProcessData` {Function | undefined} Processes the audio frame before it leaves the `AudioMixer`.
  - `highWaterMark` {Number | undefined} Output audio frame size.
  - `autoClose` {Boolean | undefined} Automatically destroys the `AudioMixer` when all [AudioInputs](AudioInput.md#class-audioinput) are closed.
  - `generateSilent` {Boolean | undefined} Generates silent audio frames when there are no [AudioInputs](AudioInput.md#class-audioinput) or when they are empty.
  - `silentDuration` {Number | undefined} Duration of silent audio frame (in ms).
  - `delayTime` {Number | Function} Mix audio frames with delay (in ms).

**Example:**
```typescript
const mixer = new AudioMixer({
	sampleRate: 48000,
	channels: 1,
	bitDepth: 16,
});
```

### AudioMixer.params
Reading returns an immutable [MixerParams](../../../src/Types/ParamTypes.ts#L17) object.
Assigning updates the [AudioMixer](#class-audiomixer) params.

**Example:**
```typescript
// read params from mixer
console.log(mixer.params); // { sampleRate: 48000, channels: 1, bitDepth: 16, endianness: "LE" }

// Assign new params to the mixer
mixer.params = {
  volume: 50,
  autoClose: true,
};

// Read it again
console.log(mixer.params); // { sampleRate: 48000, channels: 1, bitDepth: 16, endianness: "LE" volume: 50, autoClose: true }
```

### AudioMixer.createAudioInput(inputParams)
Creates a new [AudioInput](AudioInput.md#class-audioinput) instance and adds it to the [AudioMixer](#class-audiomixer).

- `inputParams` {[InputParams](../../../src/Types/ParamTypes.ts#L25)} `InputParams` configuration.

**Returns:** {[AudioInput](AudioInput.md#class-audioinput)} A new `AudioInput` instance.

**Example:**
```typescript
const firstInput = mixer.createAudioInput({
	sampleRate: 48000,
	channels: 1,
	bitDepth: 16,
	volume: 90,
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

### AudioMixer.removeAudioInput(audioInput)
- `audioInput` {AudioInput}

Removes an [AudioInput](AudioInput.md#class-audioinput) from the [AudioMixer](#class-audiomixer) if it exists.

**Returns:** {Boolean} true or false

**Example:**
```typescript
// Removing the first AudioInput
console.log(mixer.removeAudioInput(firstInput)); // true

// Attempt to remove the same AudioInput
console.log(mixer.removeAudioInput(firstInput)); // false
```

### AudioMixer.destroy()
Destroys the [AudioMixer](#class-audiomixer) and all [AudioInputs](AudioInput.md#class-audioinput).

**Example:**
```typescript
mixer.destroy();
```

## Events: AudioMixer

### Event 'createInput'
Emitted when an [AudioInput](AudioInput.md#class-audioinput) is created in the [AudioMixer](#class-audiomixer).
- `name` {String} The name of the created `AudioInput`.

```typescript
mixer.on('createInput', (name: string) => {
  console.log(`AudioInput "${name}" has been removed.`);
})
```

### Event 'removeInput'
Emitted when the [AudioInput](AudioInput.md#class-audioinput) is removed from the [AudioMixer](#class-audiomixer).
- `name` {String} The name of the removed `AudioInput`.

```typescript
mixer.on('removeInput', (name: string) => {
  console.log(`AudioInput "${name}" has been removed.`);
})
```
