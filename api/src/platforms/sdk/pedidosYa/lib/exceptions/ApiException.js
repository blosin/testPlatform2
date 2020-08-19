class ApiException extends Error {
  constructor(message = '', code = '') {
    super();
    this.message = message;
    this.code = code;
  }

  static buildFromResponse(response) {
    let instance = new this();
    instance.code = response.body.code;
    if (response.body.code) {
      instance.message += response.body.messages.join(',');
    }
    return instance;
  }
}
module.exports = ApiException;
