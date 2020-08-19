const url = require('url');
import jwt from 'jsonwebtoken';
import settings from '../config/settings';

const logger = require('../config/logger');

const find = async (model, req, res) => {
  try {
    let urlParts = url.parse(req.url, true);
    let queryParams = urlParts.query;

    let sort, filter = {};
    let select = '';
    let populates = [];

    if (queryParams.sort)
      sort = JSON.parse(queryParams.sort);
    if (queryParams._filters)
      filter = JSON.parse(queryParams._filters);
    if (queryParams._populates)
      populates = JSON.parse(queryParams._populates);
    if (queryParams._select)
      select = JSON.parse(queryParams._select);

    //Verifico deleteAt null
    filter.deletedAt = null;

    const find = await model.find(filter)
      .select(select)
      .populate(populates || [])
      .sort(sort);

    return res.status(200).json(find).end();

  } catch (error) {
    const msg = 'Can not find any object.';
    logger.error({ message: msg, meta: { body: req.body, error: error.toString() } });
    return res.status(400).json({ error: msg }).end();
  }
}

const findById = async (model, req, res) => {
  try {
    let urlParts = url.parse(req.url, true);
    let queryParams = urlParts.query;

    let sort = {};
    let filter = {};
    let select = '';
    let populates = [];

    if (queryParams.sort)
      sort = JSON.parse(queryParams.sort);
    if (queryParams._filters)
      filter = JSON.parse(queryParams._filters);
    if (queryParams._populates)
      populates = JSON.parse(queryParams._populates);
    if (queryParams._select)
      select = JSON.parse(queryParams._select);

    const find = await model
      .findById(req.params.id)
      .select(select)
      .populate(populates || [])
      .sort(sort);
    return res.status(200).json(find).end();
  } catch (error) {
    const msg = 'Can not find any object.';
    logger.error({ message: msg, meta: { body: req.body, error: error.toString() } });
    return res.status(400).json({ error: msg }).end();
  }
}

/**
* Do the login using the body attibutes.
* @param model Model to login.
* @param req Request of the endpoint.
* @param res Response of the endpoint.
* @param findParams Params of the model to select.
* @param filterParams Params of the model to return in response body. If it's set to null, the model will be return like findParams filter.
* @param expiresIn Time to expire the token. If it's set to null, the token will never expire.
* @returns { data: user, accessToken } User object has only filterParams
*/
const login = async (model, req, res, findParams = {}, filterParams = undefined, expiresIn = '24h') => {
  const params = req.body;
  findParams.permissions = true;

  if (!req.body) {
    logger.error({ message: 'Insufficient params.', meta: req.body });
    return res.status(400).json({
      error: 'Insufficient params.'
    }).end();
  }

  //Verifico que no este dado de baja
  params.deletedAt = null;
  
  try {
    let user = await model.findOne(params, findParams);
    if (!!user) {
      const accessToken = jwt.sign({ user }, settings.token.secret, { expiresIn });

      if (!!filterParams) {
        Object.keys(filterParams).forEach((k) => {
          filterParams[k] = user[k];
        });
        user = filterParams;
      }

      return res.status(200).json({
        data: user,
        accessToken
      }).end();
    } else {
      throw 'Username or password are incorrect.';
    }
  } catch (error) {
    logger.error({ message: 'Login failed.', meta: { body: req.body } });
    return res.status(401).json({
      error: error
    }).end();
  }
}

const deleteModel = async (model, req, res) => {
  const id = req.params.id;
  try {
    const data = await model.findByIdAndUpdate(id, { deletedAt: new Date()}, {
      new: true,
      runValidators: true,
      context: 'query'
    });
    if (!data)
      throw 'No data updated.';

    return res.status(200).json(data).end();
  } catch (error) {
    const msg = 'Object could not be updated.';
    logger.error({
      message: msg,
      meta: { body: req.body, error: error.toString() }
    });
    return res.status(400).json({ error: msg }).end();
  }
}

const destroyModel = async (model, req, res) => {
  try {
    const _id = req.params.id || '';
    const data = await model.findOneAndRemove({ _id });
    data.remove();
    if (!data)
      throw `Object could not be found. id: ${_id}`;
    return res.status(200).json(data).end();
  } catch (error) {
    const msg = 'Object could not be destroyed.';
    logger.error({ message: msg, meta: { body: req.body } });
    return res.status(400).json({ error: msg }).end();
  }
}

const save = async (model, req, res) => {
  try {
    const params = req.body;
    if (req.params.id)
      params.id = req.params.id;

    if (params.id) {
      let data = await model.update({ _id: params.id }, params);
      return res.status(200).json(data).end();
    } else {
      let data = await model.create(params);
      return res.status(200).json(data).end();
    }
  } catch (error) {
    const msg = 'Object could not be saved.';
    logger.error({ message: msg, meta: { body: req.body, error: error.toString() } });
    return res.status(400).json({ error: error }).end();
  }
}

const findByIdAndUpdate = async (model, req, res) => {
  const params = req.body;
  const id = req.params.id || ''
  try {
    const data = await model.findByIdAndUpdate(id, params, {
      new: true,
      runValidators: true,
      context: 'query'
    });
    if (!data)
      throw 'No data updated.';

    return res.status(200).json(data).end();
  } catch (error) {
    const msg = 'Object could not be updated.';
    logger.error({
      message: msg,
      meta: { body: req.body, error: error.toString() }
    });
    return res.status(400).json({ error: error }).end();
  }
}

module.exports = {
  find,
  findById,
  login,
  deleteModel,
  destroyModel,
  save,
  findByIdAndUpdate
}