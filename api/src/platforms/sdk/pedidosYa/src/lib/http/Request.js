/**
 * API request data class
 * @class Request
 */
class Request {
  constructor() {
    /**
     * Body of the request represented as a object
     * @type {Object}
     */
    this._body = {};

    /**
     * Object of needed headers for the request
     * @type {Object}
     */
    this._headers = {};

    /**
     * Object of needed parameters for the request
     * @type {Object}
     * @private
     */
    this._parameters = {};

    /**
     * Requests endpoint. Should be relative
     * @type {String}
     * @private
     */
    this._endpoint = null;

    /**
     * Defined timeout of the request
     * @type {Number}
     * @private
     */
    this._timeout = 10000;
  }

  get body() {
    return this._body;
  }

  set body(value) {
    this._body = value;
  }

  get headers() {
    return this._headers;
  }

  set headers(value) {
    this._headers = value;
  }

  get parameters() {
    return this._parameters;
  }

  set parameters(value) {
    this._parameters = value;
  }

  get endpoint() {
    return this._endpoint;
  }

  set endpoint(value) {
    this._endpoint = value;
  }

  get timeout() {
    return this._timeout;
  }

  set timeout(value) {
    this._timeout = value;
  }
}
module.exports = Request;
