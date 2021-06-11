import model from '../models/platform';
import PlatformFactory from '../platforms/management/factory_platform';
import logger from '../config/logger';
import _helpers from './_helpers';
import PlatformSingleton from '../utils/platforms';
import SetNews from '../platforms/management/strategies/set-news';
import NewsTypeSingleton from '../utils/newsType';
import { isArray } from 'lodash';

const findAll = (req, res) => {
  return _helpers.find(model, req, res);
};

const findById = (req, res) => {
  return _helpers.findById(model, req, res);
};

const saveOne = (req, res) => {
  let result = _helpers.save(model, req, res);
  initPlatform(req.body.internalCode, req.uuid);
  return result;
};

const updateOne = (req, res) => {
  let result = _helpers.findByIdAndUpdate(model, req, res);
  initPlatform(req.body.internalCode, req.uuid);
  return result;
};

const initPlatform = (internalCode, uuid) => {
  const platformFactory = new PlatformFactory();
  return platformFactory.createPlatform(
    PlatformSingleton.getByCod(internalCode),
    uuid
  );
};

const deleteOne = (req, res) => {
  return _helpers.deleteModel(model, req, res);
};

const login = async (req, res) => {
  try {
    if (!req.body.thirdPartyId || !req.body.thirdPartySecret) {
      const msg = 'Insuficient parameters.';
      logger.error({ message: msg, meta: { body: req.body } });
      return res.status(400).json({ error: msg }).end();
    }
    /* Update last contact with the platform */
    await model.updateOne(
      {
        'credential.data.thirdPartyId': req.body.thirdPartyId
      },
      {
        lastContact: new Date()
      }
    );
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
    };
    return _helpers.login(model, req, res, findParams, filterParams, undefined);
  } catch (error) {
    const msg = 'Can not login to the platform.';
    logger.error({
      message: msg,
      meta: { error: error.toString(), body: req.body }
    });
    return res.status(400).json({ error: msg }).end();
  }
};

const saveOrder = (req, res) => {
  /* TODO: VALIDATE DATA TYPE OF INPUT */

  const platform = initPlatform(req.token.internalCode, req.uuid);
  if (isArray(req.body)) {
    req.body.forEach(async (data) => {
      let result = await req.body.filter((filtro) => filtro.id === data.id);
      if (result.length > 1)
        return res
          .status(400)
          .json({
            error: `The array has more than one order with the id:${data.id}`
          })
          .end();
    });
    const resultProm = req.body.map((data) => platform.validateNewOrders(data));
    Promise.all(resultProm)
      .then((resultPromise) => {
        res.status(200).send(resultPromise).end();
      })
      .catch((error) => {
        res.status(400).json(error).end();
      });
  } else
    platform
      .validateNewOrders(req.body)
      .then((ordersSaved) => {
        res.status(200).send(ordersSaved).end();
      })
      .catch((error) => res.status(400).json(error).end());
};

const cancelOrder = async (req, res) => {
  try {
    if (!req.body.id || !req.body.branchId) {
      const msg = 'Insuficient parameters.';
      logger.error({ message: msg, meta: { body: req.body } });
      return res.status(400).json({ error: msg }).end();
    }
    const setNews = new SetNews(req.token);
    let newToSet = { typeId: NewsTypeSingleton.idByCod('platform_rej_ord') };
    const result = await setNews.setNews(newToSet, req.body.id);
    res.status(200).send(result).end();
  } catch (error) {
    return res.status(400).json(error).end();
  }
};

const findOrder = (req, res) => {
  const platform = initPlatform(req.token.internalCode, req.uuid);
  platform
    .findOrder(parseInt(req.params.id, 10))
    .then((foundOrder) => res.status(200).send(foundOrder).end())
    .catch((error) => res.status(400).json(error).end());
};

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
};
