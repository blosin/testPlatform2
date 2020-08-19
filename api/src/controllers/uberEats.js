import PlatformFactory from '../platforms/management/factory_platform';
import PlatformSingleton from '../utils/platforms';



const initPlatform = (internalCode, uuid) => {
    const platformFactory = new PlatformFactory();
    platformFactory.createPlatform(PlatformSingleton.getByCod(internalCode), uuid);
}

const getDeliveryInfo = (req, res) => {
  console.log("WEBHOOK")
}

module.exports = {
    initPlatform,
    getDeliveryInfo,
}
