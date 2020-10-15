import model from '../models/platform';
import PlatformFactory from '../platforms/management/factory_platform';
import logger from '../config/logger';
import _helpers from './_helpers';
import PlatformSingleton from '../utils/platforms';
import SetNews from '../platforms/management/strategies/set-news';
import NewsTypeSingleton from '../utils/newsType';

const findAll = (req, res) => {
    return _helpers.find(model, req, res);
}

const findById = (req, res) => {
    return _helpers.findById(model, req, res);
}

const saveOne = (req, res) => {
    let result = _helpers.save(model, req, res);
    initPlatform(req.body.internalCode, req.uuid);
    return result;
}

const updateOne = (req, res) => {
    let result = _helpers.findByIdAndUpdate(model, req, res);
    initPlatform(req.body.internalCode, req.uuid);
    return result;
}

const initPlatform = (internalCode, uuid) => {
    const platformFactory = new PlatformFactory();
    platformFactory.createPlatform(PlatformSingleton.getByCod(internalCode), uuid);
}

const deleteOne = (req, res) => {
    return _helpers.deleteModel(model, req, res);
}

const login = async (req, res) => {
    try {
        if (!req.body.thirdPartyId || !req.body.thirdPartySecret) {
            const msg = 'Insuficient parameters.';
            logger.error({ message: msg, meta: { body: req.body } });
            return res
                .status(400)
                .json({ error: msg })
                .end();
        }
        /* Update last contact with the platform */
        await model.updateOne({
            'credential.data.thirdPartyId': req.body.thirdPartyId
        }, {
            lastContact: new Date()
        });
        const findParams = {
            id: true,
            name: true,
            'credentials.data.thirdPartyId': true,
            'credentials.data.thirdPartySecret': true,
            internalCode: true
        };
        const filterParams = {
            id: true,
            name: true,
            permissions: true
        };

        req.body = {
            'credentials.data.thirdPartyId': req.body.thirdPartyId,
            'credentials.data.thirdPartySecret': req.body.thirdPartySecret
        }
        return _helpers.login(model, req, res, findParams, filterParams, undefined);
    } catch (error) {
        const msg = 'Can not login to the platform.';
        logger.error({ message: msg, meta: { error: error.toString(), body: req.body } });
        return res
            .status(400)
            .json({ error: msg })
            .end();
    }
}

const saveOrder = (req, res) => {
    /* TODO: VALIDATE DATA TYPE OF INPUT */
    if (!Array.isArray(req.body)) {
        const msg = 'Body must be an array.';
        logger.error({ message: msg, meta: { body: req.body } });
        res
            .status(400)
            .json({ error: msg })
            .end();
    }
    const platformFactory = new PlatformFactory();
    const platform = platformFactory.createPlatform(PlatformSingleton.getByCod(req.token.internalCode), req.uuid);

    platform.validateNewOrders(req.body)
        .then((ordersSaved) =>
            res
                .status(200)
                .send(ordersSaved)
                .end())
        .catch((error) =>
            res
                .status(400)
                .json(error)
                .end());
}

const cancelOrder = async (req, res) => {
    try {
        if (!req.body.id || !req.body.branchId) {
            const msg = 'Insuficient parameters.';
            logger.error({ message: msg, meta: { body: req.body } });
            res
                .status(400)
                .json({ error: msg })
                .end();
        }
        const setNews = new SetNews(req.token);
        let newToSet = { typeId: NewsTypeSingleton.idByCod('platform_rej_ord') };
        const result = await setNews.setNews(newToSet, req.body.id);
        res
            .status(200)
            .send(result)
            .end();

    } catch (error) {
        res
            .status(400)
            .json(error)
            .end();
    }
}

const findOrder = (req, res) => {
    const platformFactory = new PlatformFactory();
    const platform = platformFactory.createPlatform(PlatformSingleton.getByCod(req.token.internalCode), req.uuid);

    platform.findOrder(parseInt(req.params.id, 10))
        .then((foundOrder) =>
            res
                .status(200)
                .send(foundOrder)
                .end())
        .catch((error) =>
            res
                .status(400)
                .json(error)
                .end());
}

module.exports = {
    findAll,
    findById,
    saveOne,
    updateOne,
    deleteOne,
    login,
    saveOrder,
    cancelOrder,
    findOrder
}
