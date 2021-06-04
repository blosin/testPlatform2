import ThirdParty from '../thirdParty';

class ThirdPartySingleton {
  static instance = [];

  constructor() {}

  static getInstance(platform) {
    let result;
    ThirdPartySingleton.instance.forEach((p) => {
      if (p._platform.internalCode == platform.internalCode) result = p;
    });
    if (!result) {
      const newThirdParty = new ThirdParty(platform);
      ThirdPartySingleton.instance.push(newThirdParty);
      return newThirdParty;
    } else return result;
  }

  static setInstance() {
    ThirdPartySingleton.instance = [];
  }
}

export default ThirdPartySingleton;
