'use strict';
import PlatformModel from '../models/platform';

class PlatformSingleton {
  static getInstance(loadAll = false) {
    return new Promise(async (resolve, reject) => {
      if (!PlatformSingleton.instance || loadAll) {
        PlatformSingleton.instance = new PlatformSingleton();
        PlatformSingleton.platforms = await PlatformModel.aggregate([
          {
            $project: {
              internalCode: '$internalCode',
              name: '$name',
              credentials: '$credentials',
              statusResponse: '$statusResponse',
              deletedAt: '$deletedAt'
            }
          },
          { $match: { deletedAt: null } }
        ]);
      }
      resolve(PlatformSingleton.instance);
    });
  }

  static getByCod(internalCode) {
    return PlatformSingleton.platforms.find(
      (p) => p.internalCode == internalCode
    );
  }
}

export default PlatformSingleton;
