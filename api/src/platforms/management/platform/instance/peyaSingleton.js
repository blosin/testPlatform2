'use strict';
import Peya from '../peya';

class PeyaSingleton {
  constructor() {}

  static getInstance(platform) {
    if (!PeyaSingleton.instance) {
      PeyaSingleton.instance = new Peya(platform);
    }
    return PeyaSingleton.instance;
  }
  static setInstance() {
    PeyaSingleton.instance = null;
  }
}

export default PeyaSingleton;
