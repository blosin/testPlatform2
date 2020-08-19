'use strict'
import newsStatesModel from '../models/newsState';

class NewsStateSingleton {
    static getInstance() {
        return new Promise(async (resolve, reject) => {
            if (!NewsStateSingleton.instance) {
                NewsStateSingleton.instance = new NewsStateSingleton();
                NewsStateSingleton.newsStates = await newsStatesModel
                    .aggregate([
                        {
                            $project: {
                                cod: '$cod',
                                stateId: '$stateId',
                                name: '$name',
                                _id: 0
                            }
                        }
                    ]);
            }
            resolve(NewsStateSingleton.instance);
        });
    }

    static stateById(stateId) {
        return NewsStateSingleton.newsStates.find((state) => state.stateId == stateId).name;
    }

    static stateByCod(cod) {
        return NewsStateSingleton.newsStates.find((state) => state.cod == cod).name;
    }

    static idByCod(cod) {
        return NewsStateSingleton.newsStates.find((state) => state.cod == cod).stateId;
    }
}

export default NewsStateSingleton;