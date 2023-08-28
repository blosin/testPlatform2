import model from '../models/branch';
import news from '../models/news';

import SetNews from '../platforms/management/strategies/set-news';
import logger from '../config/logger';
import _helpers from './_helpers';
import PlatformFactory from '../platforms/management/factory_platform';
import NewsTypeSingleton from '../utils/newsType';
import PlatformSingleton from '../utils/platforms';
import CustomError from '../utils/errors/customError';
import { APP_BRANCH } from '../utils/errors/codeError';
import logError from '../models/logError';

import _ from 'lodash';

async function udpdateLastGetNews(branchId) {
  try {
    await model.updateOne(
      {
        branchId: branchId
      },
      {
        lastGetNews: new Date()
      },
      { new: true, runValidators: true, context: 'query' }
    );
  } catch (error) {
    try {      
      logError.create({
        message: 'Falló udpdateLastGetNews branch',
        error:{ error: error.toString(), message: error.message, stack: error.stack}
      });
    } catch (error) {
      logError.create({
        message: 'Falló udpdateLastGetNews branch',
        error: { error: 'Error inesperado en udpdateLastGetNews branch' }
      });
    } 
    error = { error: error.toString() };
    const msg = `Failed to update lastGetNews.`;
    logger.error({ message: msg, meta: error });
  }
}

const getNews = async (req, res) => {
  try {
    const query = {
      branchId: req.token.branchId,
      typeId: {
        $ne: NewsTypeSingleton.idByCod('rej_closed_ord')
      },
      viewed: null
    };
    let newsOrders = await news.aggregate([{ $match: query }]);
    newsOrders.forEach((n) => {
      n.id = n._id;
      delete n._id;
    });
    const platformFactory = new PlatformFactory();
    const pedidosYaInternalCode = 1;
    const pedidosYa = platformFactory.createPlatform(
      PlatformSingleton.getByCod(pedidosYaInternalCode),
      req.uuid
    );
    pedidosYa.callHeartBeat(req.token);
    udpdateLastGetNews(req.token.branchId);
    return res.status(200).json(newsOrders).end();
  } catch (error) {
    try {      
      logError.create({
        message: 'Falló getNews branch',
        error:{ error: error.toString(), message: error.message, stack: error.stack}
      });
    } catch (error) {
      logError.create({
        message: 'Falló getNews branch',
        error: { error: 'Error inesperado en getNews branch' }
      });
    }
    const msg = 'No se pudieron obtener novedades de la sucursal';
    const meta = { error: error.toString() };
    const err = new CustomError(APP_BRANCH.LOGIN, msg, req.uuid, meta);
    return res.status(400).json(err).end();
  }
};

const setNews = (req, res) => {
  if (!Array.isArray(req.body)) {
    const msg = 'Body must be an array.';
    logger.error({ error: msg, meta: { body: req.body } });
    return res.status(400).json({ error: msg }).end();
  }
  if (req.body.some((n) => !n || !n.typeId)) {
    const msg = 'The new has no typeId.';
    logger.error({ error: msg, meta: { body: req.body } });
    return res
      .status(400)
      .json({ message: msg, news: { body: req.body } })
      .end();
  }

  const newsForFilter = req.body;

  const newsNoIds = newsForFilter.filter((n) => !n.id);
  const totalIds = newsForFilter.filter((n) => !!n.id).map((n) => n.id);
  const uniqueIds = _.uniqWith(totalIds, _.isEqual);

  /* Must be process sequentially */
  new Promise(async (resolve) => {
    for (let id of uniqueIds) {
      let newsToSet = newsForFilter.filter((n) => n.id == id);
      for (let newToSet of newsToSet) {
        try {
          let setNews = new SetNews(req.token.branchId, req.uuid);
          await setNews.setNews(newToSet);
        } catch (error) {
          try {      
            logError.create({
              message: 'Falló setNews branch',
              error:{ error: error.toString(), message: error.message, stack: error.stack, newToSet:newToSet}
            });
          } catch (error) {
            logError.create({
              message: 'Falló setNews branch',
              error: { error: 'Error inesperado en setNews branch' }
            });
          }
          const msg = 'No se pudo procesar la novedad.';
          const meta = { error: error.toString(), newToSet };
          const err = new CustomError(APP_BRANCH.LOGIN, msg, req.uuid, meta);
        }
      }
    }
  });

  /* Can be process in parallel */
  for (let newToSet of newsNoIds) {
    try {
      let setNews = new SetNews(req.token.branchId, req.uuid);
      let res = setNews.setNews(newToSet);
    } catch (error) {
      try {      
        logError.create({
          message: 'Falló setNews branch 2',
          error:{ error: error.toString(), message: error.message, stack: error.stack, newToSet:newToSet}
        });
      } catch (error) {
        logError.create({
          message: 'Falló setNews branch 2',
          error: { error: 'Error inesperado en setNews branch' }
        });
      }
      const msg = 'No se pudo procesar la novedad.';
      const meta = { error: error.toString(), newToSet };
      const err = new CustomError(APP_BRANCH.LOGIN, msg, req.uuid, meta);
    }
  }

  return res
    .status(200)
    .json({ message: 'All news were successfully processed.' })
    .end();
};

const updateDate = async (req, res) => {
  try {
    const platformFactory = new PlatformFactory();
    const pedidosYaInternalCode = 1;
    const pedidosYa = platformFactory.createPlatform(
      PlatformSingleton.getByCod(pedidosYaInternalCode),
      req.uuid
    );
    pedidosYa.callHeartBeat(req.token);
    udpdateLastGetNews(req.token.branchId);
    return res.status(200).json({}).end();
  } catch (error) {
    try {      
      logError.create({
        message: 'Falló updateDate branch',
        error:{ error: error.toString(), message: error.message, stack: error.stack }
      });
    } catch (error) {
      logError.create({
        message: 'Falló updateDate branch',
        error: { error: 'Error inesperado en updateDate branch' }
      });
    }
    const msg = 'No se pudieron obtener novedades de la sucursal';
    const meta = { error: error.toString() };
    const err = new CustomError(APP_BRANCH.LOGIN, msg, req.uuid, meta);
    return res.status(400).json(err).end();
  }
};

module.exports = {
  getNews,
  setNews,
  updateDate,
  udpdateLastGetNews
};
