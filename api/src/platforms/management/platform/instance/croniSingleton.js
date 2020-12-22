'use strict';

import Croni from '../croni';

class CroniSingleton {
  constructor() {}

  static getInstance(platform) {
    if (!CroniSingleton.instance) {
      CroniSingleton.instance = new Croni(platform);
    }
    return CroniSingleton.instance;
  }
}

export default CroniSingleton;
