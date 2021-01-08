var colors = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0]
var audios = {}


const piano = document.getElementById('piano');


for (let i = 0; i < 12 * 6; i++) {
    const key = document.createElement('div');
    key.id = 'piano';

    key.className = colors[i % 12] == 1 ? "black_key" : "white_key";
    piano.append(key);

    key.onmouseenter = function () {
        audios[i+24].pause();
        audios[i+24].currentTime = 0;
        audios[i+24].play();

        key.className = colors[i%12] == 1 ? "black_key_pressed" : "white_key_pressed";
    }

    key.onmouseleave = function () {
        audios[i+24].pause();

        key.className = colors[i % 12] == 1 ? "black_key" : "white_key";;
    }
}
document.body.append(piano);


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

        console.log("LOADED:" + name);
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
            option.innerHTML = out[value];
            select.append(option);
        }
        select.onchange = function () {
            load(document.getElementById("instrument").value);
        }
    })



navigator.requestMIDIAccess({ sysex: true })
    .then(function (access) {

        // Get lists of available MIDI controllers
        const inputs = access.inputs;
        const outputs = access.outputs;

        for (let [key, value] of inputs) {
            value.onmidimessage = function (e) {
                let on = e.data[0] == 144 ? true : false;
                let note = e.data[1];

                if (note >= 9 && note <= 96) {
                    const pkeys = piano.children;

                    if (on) {
                        audios[note].pause();
                        audios[note].currentTime = 0;
                        audios[note].play();

                        if (note >= 24 && note <= 24+12*6) {
                            pkeys[note - 24].className = colors[(note-24) % 12] == 1 ? "black_key_pressed" : "white_key_pressed";
                        }
                    } else {
                        audios[note].pause();

                        if (note >= 24 && note <= 24+12*6) {
                            pkeys[note - 24].className = colors[(note-24) % 12] == 1 ? "black_key" : "white_key";
                        }
                    }
                }
            };
        }
    });