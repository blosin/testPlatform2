const ApiCredentials = require('./ApiCredentials');
const Connection = require('./Connection');
const Environments = require('./Environments');
const Request = require('./Request');
const ApiException = require('../exceptions/ApiException');
const moment = require('moment');

/**
 * API REST client
 * @class ApiConnection
 */
class ApiConnection {
  /**
   * ApiConnection constructor.
   * @param {Credentials} credentials
   */
  constructor(credentials) {
    /**
     * Service access credentials
     * @type Credentials
     */
    this._credentials = new ApiCredentials(credentials);
    this._connection = new Connection(this._url());
    this._token = null;
    this._tokenAge = null;
    this._tokenTimeout = 60;
    this._credentials = credentials;
    this._restaurantId = null;
    this._iSmSurl = this._ismsUrl();
  }

  get credentials() {
    return this._credentials;
  }

  get restaurantId() {
    return this._restaurantId;
  }

  get iSmSurl() {
    return this._iSmSurl;
  }

  /**
   * Call a generic Api GET
   * @param {Request} Request object
   * @return {Response} Response object
   * @throws {ApiException}
   */
  async get(request) {
    try {
      await this._doAuthenticate();
      request.headers.Authorization = this._token;
      let encode = encodeURI(request.endpoint);
      request.endpoint = encode;
      let response = await this._connection.get(request);
      if (response.statusCode === 403) {
        this._invalidateCredentials();
      }
      return response;
    } catch (error) {
      throw new ApiException(500, 0, error);
    }
  }

  /**
   * Call a generic Api POST
   * @param {Request} Request object
   * @return {Response} Response object
   * @throws {ApiException}
   */
  async post(request) {
    try {
      await this._doAuthenticate();
      request.headers.Authorization = this._token;
      request.headers = Object.assign(request.headers, {
        'Content-Type': 'application/json;charset=UTF-8'
      });
      let response = await this._connection.post(request);
      if (response.statusCode === 403) {
        this._invalidateCredentials();
      }
      return response;
    } catch (error) {
      throw new ApiException(500, 0, error);
    }
  }

  /**
   * Call a generic Api PUT
   * @param {Request} Request object
   * @return {Response} Response object
   * @throws {ApiException}
   */
  async put(request) {
    try {
      await this._doAuthenticate();
      request.headers.Authorization = this._token;
      request.headers = Object.assign(request.headers, {
        'Content-Type': 'application/json;charset=UTF-8'
      });
      let response = await this._connection.put(request);
      if (response.statusCode === 403) {
        this._invalidateCredentials();
      }
      return response;
    } catch (error) {
      throw new ApiException(500, 0, error);
    }
  }

  /**
   * Call a generic Api PUT
   * @param {Request} Request object
   * @return {Response} Response object
   * @throws {ApiException}
   */
  async delete(request) {
    try {
      await this._doAuthenticate();
      request.headers.Authorization = this._token;
      request.headers = Object.assign(request.headers, {
        'Content-Type': 'application/json;charset=UTF-8'
      });
      let response = await this._connection.delete(request);
      if (response.statusCode === 403) {
        this._invalidateCredentials();
      }
      return response;
    } catch (error) {
      throw new ApiException(500, 0, error);
    }
  }

  /**
   * Make a request login against the API.
   * Remember to have valid credentials
   * @return {Boolean} If can authenticate successfully
   * @throws {ApiException} If some error has occurred
   */
  async authenticate() {
    try {
      let clientId = this._credentials.clientId;
      let clientSecret = this._credentials.clientSecret;

      let username = this._credentials.username;
      let password = this._credentials.password;

      let accessKey = 'access';
      let tokenKey = 'token';
      let restaurantKey = 'restaurant';

      let body = {
        client_id: clientId,
        client_secret: clientSecret
      };
      if (!(username === null && password === null)) {
        body.username = username;
        body.password = password;
      }

      let request = new Request();
      request.body = body;
      request.endpoint = 'users/login';

      let response = await this._connection.post(request);
      if (response.statusCode === 200) {
        let json = response.body;
        let access = json[accessKey];
        let restaurant = json[restaurantKey];
        let push = access.push;
        let pushAvailable = push.available;

        this._credentials = new ApiCredentials(this._credentials);
        if (pushAvailable) {
          this._credentials.orderAccessKey = push.keyId;
          this._credentials.orderSecretKey = push.keySecret;
          this._credentials.regionEndpoint = push.region;
          this._credentials.queueName = push.queueName;
        }
        if (!(username === null && password === null)) {
          this._restaurantId = restaurant.id;
        }
        this._token = access[tokenKey];
        this._tokenAge = moment();
        return true;
      }
      throw ApiException.buildFromResponse(response);
    } catch (error) {
      console.log('error authenticate');
    }
  }

  /**
   * Check if the SDK is authenticated or not
   * @return {Boolean} true if authenticated
   */
  isAuthenticated() {
    return this._token && this._tokenAge;
  }

  async _doAuthenticate() {
    if (this._token === null || this._tokenAge === null) {
      await this.authenticate();
    } else {
      let now = moment(new Date());
      let diff = now.diff(this._tokenAge, 'minutes');
      if (diff > this._tokenTimeout) {
        await this.authenticate();
      }
    }
  }

  _invalidateCredentials() {
    this._token = null;
    this._tokenAge = null;
  }

  _url() {
    let prefix = '';
    if (this._credentials.environment !== Environments.PRODUCTION) {
      prefix = 'stg-';
    }
    return 'https://' + prefix + 'orders-api.pedidosya.com/v3/';
  }

  _ismsUrl() {
    let prefix = 'live';
    if (this._credentials.environment !== Environments.PRODUCTION) {
      prefix = 'stg';
      return 'https://' + prefix + '-management-api.pedidosya.com/self-management/';
    }
    return 'https://management-api.pedidosya.com/self-management/';
  }

  _iosUrl() {
    let prefix = 'live'
    if (this._credentials.environment !== Environments.PRODUCTION) {
      prefix = 'stg'
      return `https://${prefix}-management-api.pedidosya.com/integrations-order/`
    }
    return 'https://management-api.pedidosya.com/integrations-order/'
  }
}
module.exports = ApiConnection
