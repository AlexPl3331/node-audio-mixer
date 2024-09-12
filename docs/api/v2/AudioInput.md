## Class: AudioInput
This class represents an `AudioInput`. It extends `Writable`.

### new AudioInput(inputParams, mixerParams, removeFunction?)
 - `inputParams` {[InputParams](./AudioMixer.md#audiomixercreateaudioinputinputparams)} `AudioInput` params.
  
 - `mixerParams` {[MixerParams](./AudioMixer.md#new-audiomixermixerparams)} `AudioMixer` params.
  
 - `selfRemoveFunction` {Function} Function to remove `AudioInput` from the `AudioMixer`.

Creates a new `AudioInput` instance.

```js
const input = mixer.createAudioInput({
    sampleRate: 48000,
    channels: 1,
    bitDepth: 16,
});
```

### AudioInput.params
Getter: Returns an object of `inputParams`.

Setter: Sets the parameters using an object of `inputParams`.

```js
console.log(input.params); // { sampleRate: 48000, channels: 1, bitDepth: 16 }

input.params = {
    volume: 50,
    forceClose: true,
};

console.log(input.params); // { sampleRate: 48000, channels: 1, bitDepth: 16, volume: 50, forceClose: true }
```

### input.destroy()
Destroys the `AudioInput`.

```js
input.destroy();
```

> Note: `AudioInput` is automatically removes from the `AudioMixer` when it's closed and empty.
> To remove it immediately (with remaining data), set `forceClose` to `true`.


## Events: AudioInput

### Event 'end'
Emitted when you use `destroy` in the `AudioInput`.

```js
input.on('end', () => {
  console.log('AudioInput has finished its work');
})
```

### Event 'close'
Emitted when the `AudioInput` is empty.

```js
input.on('close', () => {
  console.log('AudioInput has closed');
})
```