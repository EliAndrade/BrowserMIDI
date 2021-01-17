const keyboardDiv = document.getElementById('piano');
const select = document.getElementById("instrument");

let keys = {
    'KeyQ': 0,
    'Digit2': 1,
    'KeyW': 2,
    'Digit3': 3,
    'KeyE': 4,
    'KeyR': 5,
    'Digit5': 6,
    'KeyT': 7,
    'Digit6': 8,
    'KeyY': 9,
    'Digit7': 10,
    'KeyU': 11,
    'KeyI': 12,
    'Digit9': 13,
    'KeyO': 14,
    'Digit0': 15,
    'KeyP': 16,

    'KeyZ': 12,
    'KeyS': 13,
    'KeyX': 14,
    'KeyD': 15,
    'KeyC': 16,
    'KeyV': 17,
    'KeyG': 18,
    'KeyB': 19,
    'KeyH': 20,
    'KeyN': 21,
    'KeyJ': 22,
    'KeyM': 23,
    'Comma': 24,
    'KeyL': 25,
    'Period': 26
}



KeyboardMIDI = {
    SOUNDFONT_SOURCE: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/{}-mp3.js',
    SOUNDFONT_NAMES: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/names.json',

    AUDIOS_FIRST_NOTE: 10,                        // First audio available
    AUDIOS_LAST_NOTE: 95,                         // Last audio available

    COLORS: [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0], // Keyboard colors
    AUDIOS: [],                                   // Loaded audios

    FIRST_NOTE: 24,                               // First note of keyboard
    OCTAVES: 6,                                   // Amount of octaves visible

    isBlackKey: function (note) {
        return this.COLORS[note % 12] == 1;
    },

    isValidKey: function (note) {
        return note >= this.AUDIOS_FIRST_NOTE && note <= this.AUDIOS_LAST_NOTE;
    },

    isVisibleKey: function (note) {
        return note >= this.FIRST_NOTE && note <= this.FIRST_NOTE + 12 * this.OCTAVES;
    },

    noteOn: function (note) {
        if (this.isValidKey(note)) {
            if (this.AUDIOS[note] != undefined) {
                this.AUDIOS[note].pause();
                this.AUDIOS[note].currentTime = 0;
                this.AUDIOS[note].play();
            }

            if (this.isVisibleKey(note)) {
                const noteOffset = note - this.FIRST_NOTE;
                const isBlack = this.isBlackKey(noteOffset);
                const keys = keyboardDiv.children;

                keys[noteOffset].className = isBlack ? "black_key_pressed" : "white_key_pressed";
            }
        }
    },

    noteOff: function (note) {
        if (this.isValidKey(note)) {
            if (this.AUDIOS[note] != undefined) {
                this.AUDIOS[note].pause();
            }

            if (this.isVisibleKey(note)) {
                const noteOffset = note - this.FIRST_NOTE;
                const isBlack = this.isBlackKey(noteOffset);
                const keys = keyboardDiv.children;

                keys[noteOffset].className = isBlack ? "black_key" : "white_key";
            }
        }
    },

    createKeyboard: function () {
        for (let i = 0; i < 12 * this.OCTAVES; i++) {
            const key = document.createElement('div');
            key.className = this.isBlackKey(i) ? "black_key" : "white_key";
            keyboardDiv.append(key);

            const that = this;

            key.onmouseenter = function () {
                that.noteOn(i + that.FIRST_NOTE);
            }

            key.onmouseleave = function () {
                that.noteOff(i + that.FIRST_NOTE);
            }
        }
    },


    loadAudios: function (name) {
        const script = document.createElement('script');
        script.src = this.SOUNDFONT_SOURCE.replace('{}', name);
        script.type = 'text/javascript';
        script.async = false;

        document.head.appendChild(script);


        const that = this;


        script.onload = function () {
            let i = 9;

            for (let key in MIDI.Soundfont[name]) {
                const audio = new Audio();
                audio.src = MIDI.Soundfont[name][key];
                that.AUDIOS[i] = audio;

                i++;
            }

            script.remove();
        }
    },


    requestMIDI: async function () {
        const that = this;

        if (navigator.requestMIDIAccess) {
            await navigator.requestMIDIAccess({ sysex: true })
                .then(function (access) {
                    const inputs = access.inputs;

                    for (let [key, value] of inputs) {
                        value.onmidimessage = function (e) {
                            let on = e.data[0] == 144 ? true : false;
                            let note = e.data[1];

                            if (note >= 9 && note <= 96) {
                                if (on) {
                                    that.noteOn(note);
                                } else {
                                    that.noteOff(note);
                                }
                            }
                        };
                    }
                });
        }
    },

    init: async function () {
        this.createKeyboard();
        this.requestMIDI();
        const that = this;

        await fetch(this.SOUNDFONT_NAMES)
            .then(res => res.json())
            .then((out) => {
                if (window.location === window.parent.location) {
                    for (let value in out) {
                        let option = document.createElement("option");
                        option.value = out[value];
                        option.innerHTML = out[value].replace(/_/g, " ");

                        select.append(option);
                    }
                    select.onchange = function () {
                        that.loadAudios(select.value);
                    }
                } else {
                    select.remove();
                    document.body.onclick = function () {
                        window.top.location.href = window.location;
                    }
                }
            })

        document.body.onkeydown = function (e) {
            if (e.code in keys && !e.repeat) {
                that.noteOn(keys[e.code] + that.FIRST_NOTE + 24);
            }
        }

        document.body.onkeyup = function (e) {
            if (e.code in keys) {
                that.noteOff(keys[e.code] + that.FIRST_NOTE + 24);
            }
        }


        this.loadAudios('acoustic_grand_piano');
    }
}

KeyboardMIDI.init();

























