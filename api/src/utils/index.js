import NewsTypeSingleton from './newsType';
import NewsStateSingleton from './newsState';
import RejectedMessagesSingleton from './rejectedMessages';
import PlatformSingleton from './platforms';
import UUID from './errors/utils';

import PlatformFactory from '../platforms/management/factory_platform';

module.exports.initUtils = () => {
    return new Promise(async (resolve) => {
        await Promise.all([
            NewsTypeSingleton.getInstance(),
            NewsStateSingleton.getInstance(),
            RejectedMessagesSingleton.getInstance(),
            PlatformSingleton.getInstance()
        ]);

        /* Load all platforms after getting them */
        loadPlatforms();
        resolve();
    });

}

const loadPlatforms = () => {
    const platformFactory = new PlatformFactory();
    const platforms = PlatformSingleton.platforms;

    platforms.forEach((platform) => {
        let uuid = UUID();
        platformFactory.createPlatform(platform, uuid);
    });
}