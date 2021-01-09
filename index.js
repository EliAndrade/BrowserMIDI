let colors = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0]
let audios = {}

let FIRST_NOTE = 24;
let OCTAVES = 6;

function noteOn(note) {
    if (note > 9 && note < 96) {
        audios[note].pause();
        audios[note].currentTime = 0;
        audios[note].play();

        const pkeys = piano.children;
        if (note >= FIRST_NOTE && note <= FIRST_NOTE + 12 * OCTAVES) {
            let isBlack = colors[(note - FIRST_NOTE) % 12] == 1;
            pkeys[note - FIRST_NOTE].className = isBlack ? "black_key_pressed" : "white_key_pressed";
        }
    }
}

function noteOff(note) {
    if (note > 9 && note < 96) {
        audios[note].pause();

        const pkeys = piano.children;
        if (note >= FIRST_NOTE && note <= FIRST_NOTE + 12 * OCTAVES) {
            let isBlack = colors[(note - FIRST_NOTE) % 12] == 1;
            pkeys[note - FIRST_NOTE].className = isBlack ? "black_key" : "white_key";
        }
    }
}

const piano = document.getElementById('piano');


for (let i = 0; i < 12 * OCTAVES; i++) {
    const key = document.createElement('div');

    key.className = colors[i % 12] == 1 ? "black_key" : "white_key";
    piano.append(key);

    key.onmouseenter = function () {
        noteOn(i + FIRST_NOTE);
    }

    key.onmouseleave = function () {
        noteOff(i + FIRST_NOTE);
    }
}


function load(name) {
    var script = document.createElement('script');
    script.src = 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/' + name + '-mp3.js';
    script.type = 'text/javascript';
    document.head.appendChild(script);

    script.onload = function () {
        let i = 9;

        for (let key in MIDI.Soundfont[name]) {
            const elem = new Audio();
            elem.src = MIDI.Soundfont[name][key];
            audios[i] = elem;
            i++;
        }

        script.remove();
    }
}


load('lead_3_calliope');

fetch('https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/names.json')
    .then(res => res.json())
    .then((out) => {
        var select = document.getElementById("instrument");
        for (let value in out) {
            let option = document.createElement("option");
            option.value = out[value];
            option.innerHTML = out[value].replace("_/g", " ");
            select.append(option);
        }
        select.onchange = function () {
            if ( window.location === window.parent.location ) {
                load(document.getElementById("instrument").value);
            } else {
                select.remove();
                document.body.onclick = function () {
                    window.parent.location = window.location;
                    window.location = window.location;
                }
            }            
        }
    })



navigator.requestMIDIAccess({ sysex: true })
    .then(function (access) {
        const inputs = access.inputs;

        for (let [key, value] of inputs) {
            value.onmidimessage = function (e) {
                let on = e.data[0] == 144 ? true : false;
                let note = e.data[1];

                if (note >= 9 && note <= 96) {
                    if (on) {
                        noteOn(note);
                    } else {
                        noteOff(note);
                    }
                }
            };
        }
    });


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

document.body.onkeydown = function (e) {
    if (e.code in keys && !e.repeat) {
        noteOn(keys[e.code] + FIRST_NOTE + 24);
    }
}

document.body.onkeyup = function (e) {
    if (e.code in keys) {
        noteOff(keys[e.code] + FIRST_NOTE + 24);
    }
}
