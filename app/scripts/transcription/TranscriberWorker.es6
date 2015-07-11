import Transcriber from './Transcriber.es6lib';
import Utils from '../utils/Utils.es6lib';
const ScriptPaths = [
  '/scripts/3rdparty/dsp.js',
  '/scripts/3rdparty/browser-polyfill.js',
];

export default class TranscriberWorker {
  constructor() {
    for (let i = 0; i < ScriptPaths.length; i++) {
      importScripts(ScriptPaths[i]);
    }

    self.addEventListener('message', e => this.onMessage(e));
  }

  onMessage(e) {
    let data = e.data;
    let msg = data.msg || {};
    let result = 'success';
    let resultMsg;

    switch (data.cmd) {
      case 'init':
        this._transcriber = new Transcriber(msg);
        this._resetSignal();
        break;
      case 'resetSignal':
        this._resetSignal();
        break;
      case 'getSignal':
        resultMsg = this._transcriber.signal;
        break;
      case 'pushSignal':
        resultMsg = this._pushSignal(msg);
        break;
      case 'transcribe':
        let signal = typeof msg.signal !== 'undefined' ? msg.signal : this._mergeSignal();
        let midi = typeof msg.midi !== 'undefined' ? msg.midi : false;

        let transcription = this._transcriber.transcribe(signal, midi);

        resultMsg = {
          transcription: transcription,
          sampleRate: this._transcriber.outputSampleRate,
          numSamples: this._transcriber.numOutputSamples,
        };
        break;
      case 'close':
        self.close();
        break;
    }

    postMessage({
      id: data.id,
      cmd: data.cmd,
      result: result,
      msg: resultMsg,
    });
  }

  _resetSignal() {
    this._signal = [];
    this.currNumSamples = 0;
  }

  _pushSignal(signal) {
    this._signal.push(signal);
    this.currNumSamples += signal.length;

    let largest = Number.MIN_VALUE;

    for (let sample of signal) {
      if (sample > largest) largest = sample;
    }

    return {
      amplitude: largest,
      timeRecorded: this.currNumSamples / this._transcriber.inputSampleRate,
      isBufferFull: this.currNumSamples >= this._transcriber.numInputSamples,
    };
  }

  _mergeSignal() {
    let length = this._transcriber.numInputSamples;
    let signal = new Float32Array(length);
    var currNumSamples = 0;

    for (let buffer of this._signal) {
      let newNumSamples = currNumSamples + buffer.length;

      if (newNumSamples <= length) {
        signal.set(buffer, currNumSamples);
      }
      else {
        signal.set(buffer.subarray(0, length - currNumSamples), currNumSamples);
      }

      currNumSamples = newNumSamples;
    }

    return signal;
  }
}

// Web workers only work in the Web worker environment
// where window is undefined
if (typeof window === 'undefined') {
  new TranscriberWorker();
}
