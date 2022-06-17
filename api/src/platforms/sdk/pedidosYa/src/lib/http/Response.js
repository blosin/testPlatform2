/**
 * API response data class
 * @class Response
 */
class Response {
  constructor() {
    /**
     * HTTP status code
     * @type {Number}
     * @private
     */
    this._statusCode = 500;

    /**
     * Object representation of the body of the response
     * @type {Object}
     * @private
     */
    this._body = null;

    /**
     * Raw body response
     * @type {String}
     * @private
     */
    this._content = null;
  }

  get statusCode() {
    return this._statusCode;
  }

  set statusCode(value) {
    this._statusCode = value;
  }

  get body() {
    return this._body;
  }

  set body(value) {
    this._body = value;
  }

  get content() {
    return this._content;
  }

  set content(value) {
    this._content = value;
  }
}
module.exports = Response;
