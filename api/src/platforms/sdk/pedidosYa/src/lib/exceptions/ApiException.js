class ApiException extends Error {
  constructor(message, code) {
    super();
    this.message = message;
    this.code = code;
  }

  static buildFromResponse(response) {
    let instance = new this();
    if (response._body) {
      instance.message = response._body.messages;
      instance.code = response._statusCode;
    }
    return instance;
  }
}
module.exports = ApiException;
