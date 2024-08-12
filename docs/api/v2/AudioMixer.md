## Class: AudioMixer
This class represents an `AudioMixer`. It extends `Readable`. It is used to mix multiple `AudioInputs` into a single audio output with specified properties.

### new AudioMixer(mixerParams)
- `mixerParams` {Object}

  - `sampleRate` {Number} Output sample rate from the `AudioMixer`.

  - `channels` {Number} Number of output channels from the `AudioMixer`.

  - `bitDepth` {Number} Output bit depth from the `AudioMixer`.

  - `endianness` {String | Undefined} Output endianness from the `AudioMixer`. <br> Default: `The endianness of your CPU`.

  - `unsigned` {Boolean | Undefined} Output audio must be unsigned.

  - `volume` {Number | Undefined} Output volume from the `AudioMixer`.

  - `preProcessData` {Function | Undefined} Process the chunk before returning it from the `AudioMixer`.

  - `highWaterMark` {Number | Undefined} Chunk output size from the AudioMixer.

  - `autoClose` {Boolean | Undefined} Automatically closes after all `AudioInputs` are closed.

  - `generateSilent` {Boolean | Undefined} Generates silent chunks when there are no `AudioInputs` or when all `AudioInputs` are empty.

  - `silentDuration` {Number | Undefined} Duration in milliseconds of the silent chunk.  

  - `delayTime` {Number | Function} Audio mixing with a delay of n milliseconds. <br> Default: `5ms`.

Creates a new `AudioMixer` instance.

```js
const mixer = new AudioMixer({
    sampleRate: 48000,
    channels: 1,
    bitDepth: 16,
});
```

### AudioMixer.params
Getter: Returns an object of `mixerParams`.

Setter: Sets the parameters using an object of `mixerParams`.

```js
console.log(mixer.params); // { sampleRate: 48000, channels: 1, bitDepth: 16 }

mixer.params = {
    volume: 50,
    autoClose: true,
};

console.log(mixer.params); // { sampleRate: 48000, channels: 1, bitDepth: 16, volume: 50, autoClose: true }
```

### AudioMixer.createAudioInput(inputArgs)
- `inputArgs` {Object}

  - `sampleRate` {Number} Input sample rate in the `AudioInput`.

  - `channels` {Number} Number of input channels in the `AudioInput`.

  - `bitDepth` {Number} Input bit depth in the `AudioInput`.

  - `endianness` {String | Undefined} Input endianness in the `AudioInput`. <br> Default: `The endianness of your CPU`.

  - `unsigned` {Boolean | Undefined} Input audio is unsigned.

  - `volume` {Number | Undefined} Input volume in the `AudioInput`.

  - `preProcessData` {Function | Undefined} Process the chunk before returning it to AudioMixer.

  - `forceClose` {Boolean | Undefined} Closes `AudioInput` even when it contains data.

  - `correctByteSize` {Boolean | Undefined} - Trims buffer if it's size is incorrect. If disabled, the entire buffer is discarded.

Creates a new `AudioInput` instance and add it to the `AudioMixer`.

```js
// Create AudioInput through AudioMixer
const firstInput = mixer.createAudioInput({
    sampleRate: 48000,
    channels: 1,
    bitDepth: 16,
    volume: 90,
});

// Or create standalone instance of AudioInput
const secondInput = new AudioInput({
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
});
```

### AudioMixer.removeAudioInput(audioInput)
- `audioInput` {AudioInput}

Removes an `AudioInput` from the `AudioMixer` if it exists.

```js
// Removing the first AudioInput
console.log(mixer.removeAudioInput(firstInput)); // true

// Attempt to remove a second AudioInput that does not exist
console.log(mixer.removeAudioInput(secondInput)); // false
```

### AudioMixer.destroy()
Closes all inputs and `AudioMixer`.

```js
mixer.destroy();
```


## Events: AudioMixer

### Event 'close'
Emitted when you use `destroy` in the `AudioMixer` or when all `AudioInputs` are closed with `autoClose` enabled.

```js
mixer.on('close', () => {
  console.log('AudioMixer has closed');
})
```

### Event 'end'
Emitted after `close` and when the `AudioMixer` no longer has any `AudioInputs`.

```js
mixer.on('end', () => {
  console.log('AudioMixer has finished its work');
})
```