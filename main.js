import './style.css';
import {createDevice}  from '@rnbo/js';

document.querySelector('#app').innerHTML = `
  <div>
    <h1>Hello RNBO!</h1>
    <div class="card">
      <button id="activate" type="button">Start Audio</button>
    </div>
  </div>
`;

// Create AudioContext
let WAContext = window.AudioContext || window.webkitAudioContext;


const setup = async (context) => {
  let rawPatcher = await fetch("rnbo_export/patch.export.json");
  let patcher = await rawPatcher.json();

  let device = await createDevice({ context, patcher });

  // This connects the device to audio output, but you may still need to call context.resume()
  // from a user-initiated function.
  device.node.connect(context.destination);
};

let btn = document.querySelector('#activate');
btn.addEventListener('click', () => {
  console.log('starting the audio context');
  let context = new WAContext();
  setup(context);
}, {once: true});
