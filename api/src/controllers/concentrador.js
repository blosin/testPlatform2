import PlatformFactory from '../platforms/management/factory_platform';
import _helpers from './_helpers';
import PlatformSingleton from '../utils/platforms';
import UUID from '../utils/errors/utils';

const setInstance = (req, res) => {
  console.log(4444);
  initPlatform(req.body.platform);
};

const initPlatform = (platform) => {
  const platformFactory = new PlatformFactory();
  platformFactory.createPlatform(platform, 1, true);
  loadPlatforms();
};

const loadPlatforms = async () => {
  const platformFactory = new PlatformFactory();
  await PlatformSingleton.getInstance(true);
  const platforms = PlatformSingleton.platforms;

  platforms.forEach((platform) => {
    let uuid = UUID();
    platformFactory.createPlatform(platform, uuid);
  });
};

module.exports = {
  setInstance
};
