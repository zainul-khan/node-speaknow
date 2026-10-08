# node-speaknow

A simple Node.js package for text-to-speech (TTS) using system voices.

Supports:

- **Windows** → PowerShell `System.Speech`
- **macOS** → built-in `say` command
- **Linux** → `espeak-ng`
- **Sequential speech** → multiple messages are queued and spoken one after another without overlapping

---

## Installation

```bash
npm install node-speaknow
```

### Linux Dependency

Linux requires **`espeak-ng`** to be installed on the system.

For Ubuntu/Debian:

```bash
sudo apt update
sudo apt install espeak-ng
```

Verify the installation:

```bash
espeak-ng --version
```

> **Note:** `espeak-ng` is a system dependency and is not installed automatically by `npm install`.

---

## Usage

### JavaScript Example

```js
const NodeSpeak = require("node-speaknow");

(async () => {
    const tts = new NodeSpeak();

    // Get available voices
    const voices = await tts.getVoices();
    console.log("Available voices:", voices);

    // Set a voice (optional)
    await tts.setVoice("Microsoft Zira Desktop");

    // Speak messages sequentially
    tts.speakNow("Hello world!");
    tts.speakNow("This will play after the first message.");
    tts.speakNow("And this one comes third.");
})();
```

### TypeScript Example

```ts
import NodeSpeak from "node-speaknow";

(async () => {
    const tts = new NodeSpeak();

    await tts.setVoice("Microsoft Zira Desktop");

    tts.speakNow("Hello from TypeScript!");
})();
```

---

## 🖥️ Supported Platforms

| Platform | TTS Engine | Dependency |
| --- | --- | --- |
| **Windows** | `System.Speech.Synthesis.SpeechSynthesizer` | PowerShell / .NET |
| **macOS** | `say` | Built into macOS |
| **Linux** | `espeak-ng` | **Requires manual installation** |

### Windows

Uses the built-in Windows `System.Speech` API through PowerShell.

No additional TTS installation is required.

### macOS

Uses the built-in macOS `say` command.

No additional TTS installation is required.

### Linux

Uses **`espeak-ng`**.

Ubuntu/Debian users need to install it manually:

```bash
sudo apt update
sudo apt install espeak-ng
```

Other Linux distributions may use their respective package manager.

For example, on Fedora:

```bash
sudo dnf install espeak-ng
```

---

## ⚡ Features

- Get available system voices
- Choose a specific voice
- Sequential speech queue
- Prevents multiple messages from overlapping
- Cross-platform support
- Works with JavaScript
- Works with TypeScript
- Uses native/system TTS engines
- No external API or internet connection required for speech synthesis

---

## 📖 API Reference

### `new NodeSpeak(options?: { voice?: string })`

Creates a new instance of the TTS engine.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `voice` | `string` | System default | Initial voice name |

Example:

```js
const tts = new NodeSpeak({
    voice: "Microsoft Zira Desktop"
});
```

---

### `getVoices(): Promise<string[]>`

Returns a list of available voices on the current operating system.

```js
const voices = await tts.getVoices();

console.log(voices);
```

On Linux, voices are provided by `espeak-ng`.

You can also see the available Linux voices directly:

```bash
espeak-ng --voices
```

---

### `setVoice(voiceName: string): Promise<void>`

Sets the active voice.

The voice name must match one of the voices returned by `getVoices()`.

```js
await tts.setVoice("Microsoft Zira Desktop");
```

---

### `speakNow(text: string): void`

Speaks the given text.

If multiple messages are submitted, they are placed into a queue and spoken sequentially.

```js
tts.speakNow("First message");
tts.speakNow("Second message");
tts.speakNow("Third message");
```

The messages will be spoken in this order:

```text
First message
      ↓
Second message
      ↓
Third message
```

---

## 🐧 Linux / Ubuntu Example

After installing the Linux dependency:

```bash
sudo apt update
sudo apt install espeak-ng
```

You can use `node-speaknow` normally:

```js
const NodeSpeak = require("node-speaknow");

(async () => {
    const tts = new NodeSpeak();

    const voices = await tts.getVoices();

    console.log("Available Linux voices:", voices);

    await tts.setVoice("en");

    tts.speakNow("Hello from Ubuntu!");
    tts.speakNow("This is node-speaknow running on Linux.");
})();
```

---

## ⚠️ Linux Server Note

If you are running `node-speaknow` on an Ubuntu server/VPS, make sure the server has an audio output device if you want to **play the speech through the server**.

Installing `espeak-ng` is enough for speech synthesis, but a headless server may not have speakers or an audio session available.

For server-side applications, generating audio files instead of directly playing audio may be more appropriate.

---

## License

MIT © 2025 Zainul Khan