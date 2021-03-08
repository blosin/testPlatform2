'use strict';

import UberEats from '../uberEats';

class UberEatsSingleton {
  constructor() {}

  static getInstance(platform) {
    if (!UberEatsSingleton.instance) {
      UberEatsSingleton.instance = new UberEats(platform);
    }
    return UberEatsSingleton.instance;
  }
}

export default UberEatsSingleton;
