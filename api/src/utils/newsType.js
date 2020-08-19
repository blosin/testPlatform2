'use strict'
import newsTypesModel from '../models/newsType';

class NewsTypeSingleton {
    static getInstance() {
        return new Promise(async (resolve, reject) => {
            if (!NewsTypeSingleton.instance) {
                NewsTypeSingleton.instance = new NewsTypeSingleton();
                NewsTypeSingleton.newsTypes = await newsTypesModel
                    .aggregate([
                        {
                            $project: {
                                cod: '$cod',
                                typeId: '$typeId',
                                name: '$name',
                                newsType: '$newsType',
                                _id: 0
                            }
                        }
                    ]);
            }
            resolve(NewsTypeSingleton.instance);
        });
    }

    static globalTypes() {
        return NewsTypeSingleton.newsTypes.filter((type) => type.newsType == 'global');
    }

    static typeById(typeId) {
        return NewsTypeSingleton.newsTypes.find((type) => type.typeId == typeId).name;
    }

    static typeByCod(cod) {
        return NewsTypeSingleton.newsTypes.find((type) => type.cod == cod).name;
    }

    static idByCod(cod) {
        return NewsTypeSingleton.newsTypes.find((type) => type.cod == cod).typeId;
    }
}

export default NewsTypeSingleton;