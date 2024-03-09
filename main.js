import './style.css';
import {createDevice}  from '@rnbo/js';

document.querySelector('#app').innerHTML = `
  <div>
    <h1>Hello RNBO!</h1>
    <div class="card">
      <button id="activate" type="button">Start Audio</button>
      <div id="rnbo-app" class="rnbo-app">
        <input type="file" id="audioFile" accept=".wav">
        <input type="range" id="vibe-rate" min="0.1" max="10" step="0.1" value="2">
        <button id="stop-audio" type="button">Stop Audio</button>
      </div>
    </div>
  </div>
`;

// Create AudioContext
let WAContext = window.AudioContext;

const setup = async (context) => {
  let rawPatcher = await fetch("rnbo_export/vibe.export.json");
  let patcher = await rawPatcher.json();

  let device = await createDevice({ context, patcher });

  // This connects the device to audio output, but you may still need to call context.resume()
  // from a user-initiated function.
  device.node.connect(context.destination);

  let audioFileSource = null;
  document.querySelector('#audioFile').addEventListener('change', function(evt) {
    let file = evt.target.files[0];
    let reader = new FileReader();
    reader.onload = function(e) {
      context.decodeAudioData(e.target.result, function(buffer) {
        // Stop the previous audio file if it's playing.
        if (audioFileSource) {
          audioFileSource.stop(0);
          audioFileSource.disconnect();
        }

        audioFileSource = context.createBufferSource();
        audioFileSource.buffer = buffer;
        audioFileSource.loop = true;
        audioFileSource.connect(device.node);
        audioFileSource.start(0);
      });
    };
    reader.readAsArrayBuffer(file);
  });



  let paramVibeRate = device.parametersById.get('rate');
  console.log(paramVibeRate);
  document.querySelector('#vibe-rate').addEventListener('input', function(evt) {
    console.log(evt.target.value);
    paramVibeRate.value = evt.target.value;
  });

  let stopButton = document.querySelector('#stop-audio');
  stopButton.addEventListener('click', function() {
    if (audioFileSource) {
      audioFileSource.stop(0);
      audioFileSource.disconnect();
    }
  });
};

let btn = document.querySelector('#activate');
let rnboApp = document.querySelector('#rnbo-app');
btn.addEventListener('click', () => {
  console.log('starting the audio context');
  let context = new WAContext();
  setup(context);
  btn.parentElement.removeChild(btn);
  rnboApp.classList.add('activated');
}, {once: true});
