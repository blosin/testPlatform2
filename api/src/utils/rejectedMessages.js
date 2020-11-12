'use strict';
import RejectedMessagesModel from '../models/rejectedMessage';

class RejectedMessagesSingleton {
  static getInstance() {
    return new Promise(async (resolve, reject) => {
      if (!RejectedMessagesSingleton.instance) {
        RejectedMessagesSingleton.instance = new RejectedMessagesSingleton();
        RejectedMessagesSingleton.rejectedMessages = await RejectedMessagesModel.aggregate(
          [
            { $match: { id: { $lte: 0 } } },
            {
              $project: {
                id: '$id',
                name: '$name',
                descriptionES: '$descriptionES',
                descriptionPT: '$descriptionPT',
                forRestaurant: '$forRestaurant',
                forLogistics: '$forLogistics',
                forPickup: '$forPickup',
                _id: 0,
              },
            },
          ],
        );
      }
      resolve(RejectedMessagesSingleton.instance);
    });
  }

  static get genericRejectedMessages() {
    return RejectedMessagesSingleton.rejectedMessages.filter((r) => r.id < 0);
  }

  static get closedResRejectedMessages() {
    return RejectedMessagesSingleton.rejectedMessages.find((r) => r.id == -3);
  }

  static get inactiveResRejectedMessages() {
    return RejectedMessagesSingleton.rejectedMessages.find((r) => r.id == -4);
  }

  static get platformRejectedMessages() {
    return RejectedMessagesSingleton.rejectedMessages.find((r) => r.id == -2);
  }
}

export default RejectedMessagesSingleton;
