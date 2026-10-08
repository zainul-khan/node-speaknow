const process = require("process");
const { exec } = require("child_process");

class NodeSpeak {
    constructor(options = {}) {
        this.voice = options.voice || null;
        this.engine = this.detectEngine();
        this.queue = [];
        this.isSpeaking = false;
    }

    detectEngine() {
        const platform = process.platform;

        if (platform === "win32") {
            this.voice = this.voice || "Microsoft David Desktop";
        } else if (platform === "darwin") {
            this.voice = this.voice || "Alex";
        } else if (platform === "linux") {
            // espeak-ng default voice
            this.voice = this.voice || "en";
        }

        return platform;
    }

    getVoices() {
        return new Promise((resolve, reject) => {
            // Windows
            if (this.engine === "win32") {
                const command = `powershell -Command "Add-Type -AssemblyName System.Speech; $voices = New-Object System.Speech.Synthesis.SpeechSynthesizer; $voices.GetInstalledVoices() | ForEach-Object { $_.VoiceInfo.Name }"`;

                exec(command, (error, stdout, stderr) => {
                    if (error) return reject(error);
                    if (stderr) return reject(new Error(stderr));

                    const voices = stdout
                        .split(/\r?\n/)
                        .map((v) => v.trim())
                        .filter(Boolean);

                    resolve(voices);
                });

            // macOS
            } else if (this.engine === "darwin") {
                exec('say -v "?"', (error, stdout, stderr) => {
                    if (error) return reject(error);
                    if (stderr) return reject(new Error(stderr));

                    const voices = stdout
                        .split(/\r?\n/)
                        .map((line) => line.trim().split(/\s{2,}/)[0])
                        .filter(Boolean);

                    resolve(voices);
                });

            // Linux
            } else if (this.engine === "linux") {
                exec("espeak-ng --voices", (error, stdout, stderr) => {
                    if (error) {
                        return reject(
                            new Error(
                                "Linux TTS requires espeak-ng. Install it using: sudo apt install espeak-ng"
                            )
                        );
                    }

                    if (stderr) {
                        return reject(new Error(stderr));
                    }

                    const voices = stdout
                        .split(/\r?\n/)
                        .slice(1)
                        .map((line) => {
                            const parts = line.trim().split(/\s+/);
                            return parts[1];
                        })
                        .filter(Boolean);

                    resolve(voices);
                });

            } else {
                reject(
                    new Error(
                        `TTS is not supported on platform: ${this.engine}`
                    )
                );
            }
        });
    }

    async setVoice(voiceName) {
        const voices = await this.getVoices();

        if (!voiceName) {
            this.voice = voices[0];
            return;
        }

        if (!voices.includes(voiceName)) {
            throw new Error(
                `Invalid voice: "${voiceName}". Available voices: ${voices.join(", ")}`
            );
        }

        this.voice = voiceName;

        console.log(`Voice set to: ${this.voice}`);
    }

    speakNow(text) {
        if (!text || typeof text !== "string") {
            throw new Error("Text must be a non-empty string.");
        }

        this.queue.push(text);
        this.processQueue();
    }

    processQueue() {
        if (this.isSpeaking || this.queue.length === 0) {
            return;
        }

        this.isSpeaking = true;

        const text = this.queue.shift();

        let command = "";

        // Windows
        if (this.engine === "win32") {
            const escapedText = text
                .replace(/\\/g, "\\\\")
                .replace(/"/g, '\\"');

            const escapedVoice = this.voice
                ? this.voice.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
                : null;

            const voicePart = escapedVoice
                ? `$speak.SelectVoice("${escapedVoice}"); `
                : "";

            command = `powershell -Command "Add-Type -AssemblyName System.Speech; $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer; ${voicePart}$speak.Speak("${escapedText}")"`;

        // macOS
        } else if (this.engine === "darwin") {
            const escapedText = text.replace(/(["\\$`])/g, "\\$1");

            command = `say ${
                this.voice
                    ? `-v "${this.voice}" `
                    : ""
            }"${escapedText}"`;

        // Linux
        } else if (this.engine === "linux") {
            const escapedText = text
                .replace(/\\/g, "\\\\")
                .replace(/"/g, '\\"')
                .replace(/`/g, "\\`")
                .replace(/\$/g, "\\$");

            command = `espeak-ng ${
                this.voice
                    ? `-v "${this.voice}" `
                    : ""
            }"${escapedText}"`;

        } else {
            console.error(
                `TTS is not supported on platform: ${this.engine}`
            );

            this.isSpeaking = false;
            return;
        }

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Speak error: ${error.message}`);
            }

            if (stderr) {
                console.error(`Speak warning: ${stderr}`);
            }

            this.isSpeaking = false;

            // Process next queued item
            this.processQueue();
        });
    }
}

module.exports = NodeSpeak;