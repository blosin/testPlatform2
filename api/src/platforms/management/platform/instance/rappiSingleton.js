'use strict';

import Rappi from '../rappi';

class RappiSingleton {
  constructor() {}

  static getInstance(platform) {
    if (!RappiSingleton.instance) {
      RappiSingleton.instance = new Rappi(platform);
    }
    return RappiSingleton.instance;
  }
}

export default RappiSingleton;
