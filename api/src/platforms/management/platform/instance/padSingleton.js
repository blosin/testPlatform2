'use strict';
import Pad from '../pad';

class PadSingleton {
  constructor() {}

  static getInstance(platform) {
    if (!PadSingleton.instance) {
      PadSingleton.instance = new Pad(platform);
    }
    return PadSingleton.instance;
  }
  static setInstance() {
    PadSingleton.instance = null;
  }
}

export default PadSingleton;
