## Class: AudioInput
This class represents an `AudioInput`. It extends `Writable`.

### new AudioInput(inputParams, mixerParams, removeFunction?)
 - `inputArgs` {[InputParams](./AudioMixer.md#audiomixercreateaudioinputinputargs)} `AudioInput` params.
  
 - `mixerArgs` {[MixerParams](./AudioMixer.md#new-audiomixermixerparams)} `AudioMixer` params.
  
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
Closes the `AudioInput`.

```js
input.destroy();
```

> Note: `AudioInput` is automatically removes when it's emits "end".
> To remove it immediately, set `forceClose` to `true`.


## Events: AudioInput

### Event 'close'
Emitted when you use `destroy` in the `AudioInput`.

```js
input.on('close', () => {
  console.log('AudioInput has closed');
})
```

### Event 'end'
Emitted when the `AudioInput` is empty.

```js
input.on('end', () => {
  console.log('AudioInput has finished its work');
})
```