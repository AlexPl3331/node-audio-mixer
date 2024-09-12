Node.js Audio Mixer
============

[![Npm packet](https://img.shields.io/npm/v/node-audio-mixer.svg?logo=npm)](https://www.npmjs.com/package/node-audio-mixer)

## About
Audio mixer that allows mixing PCM audio streams with customizable parameters.

## Installation
**Node.js 18.0.0 or newer is required.**

**npm:**
```bash
npm install node-audio-mixer
```
**pnpm:**
```bash
pnpm install node-audio-mixer
```
**yarn:**
```bash
yarn install node-audio-mixer
```

## Example usage

```javascript
import {createReadStream, createWriteStream} from "fs";
import {AudioMixer} from "node-audio-mixer";

const mixer = new AudioMixer({
    sampleRate: 48000,
    bitDepth: 16,
    channels: 1,
    autoClose: true,
});

const firstInput = mixer.createAudioInput({
    sampleRate: 48000,
    bitDepth: 16,
    channels: 1,
});
const secondInput = mixer.createAudioInput({
    sampleRate: 48000,
    bitDepth: 16,
    channels: 1,
});

const outputAudio = createWriteStream("mixed.pcm");

const firstAudio = createReadStream("firstAudio.pcm");
const secondAudio = createReadStream("secondAudio.pcm");

mixer.pipe(outputAudio);

firstAudio.pipe(firstInput);
secondAudio.pipe(secondInput);
```

<font size=3> More examples you can find **[here](https://github.com/AlexPl3331/node-audio-mixer/tree/main/examples)** </font>

## API Documentation
<font size=3> You can find it **[here](./docs/README.md)** </font>

## Changelog
<font size=3> You can view the changelogs on **[GitHub releases](https://github.com/AlexPl3331/node-audio-mixer/releases)** </font>

## License
[MIT](https://github.com/AlexPl3331/node-audio-mixer/blob/main/LICENSE)