'use strict';
import Performance from '../performance';

class PerformanceSingleton {
  static instance = null;
  constructor() {}

  static getInstance(platform) {
    if (!PerformanceSingleton.instance) {
      PerformanceSingleton.instance = new Performance(platform);
    }
    return PerformanceSingleton.instance;
  }

  static setInstance() {
    PerformanceSingleton.instance = null;
  }
}

export default PerformanceSingleton;
