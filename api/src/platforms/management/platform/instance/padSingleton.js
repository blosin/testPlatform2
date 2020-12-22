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
}

export default PadSingleton;
