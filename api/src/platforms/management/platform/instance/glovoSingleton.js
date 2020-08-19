'use strict'
import Glovo from '../glovo';

class GlovoSingleton {
    constructor() {
    }

    static getInstance(platform) {
        if (!GlovoSingleton.instance) {
            GlovoSingleton.instance = new Glovo(platform);
        }
        return GlovoSingleton.instance;
    }
}

export default GlovoSingleton;