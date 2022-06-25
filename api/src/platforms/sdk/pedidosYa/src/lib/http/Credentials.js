const Environments = require('./Environments.js');

/**
 * Contains the credentials for accessing PedidosYa API
 * @class Credentials
 */
class Credentials {
  constructor() {
    /**
     * The client id for service access
     * You should ask PedidosYa for a client id
     * @type {String}
     * @protected
     */
    this.clientId = null;

    /**
     * The client's secret access code.
     * You should ask PedidosYa for a client secret
     * @type {String}
     * @protected
     */
    this.clientSecret = null;

    /**
     * The client's username.
     * You should ask PedidosYa for a username
     * @type {String}
     * @protected
     */
    this.username = null;

    /**
     * The client's password.
     * You should ask PedidosYa for a password
     * @type {String}
     * @protected
     */
    this.password = null;

    /**
     * The environment of the credentials
     */
    this.environment = Environments.DEVELOPMENT;
  }

  get clientId() {
    return this._clientId;
  }

  set clientId(clientId) {
    this._clientId = clientId;
  }

  get clientSecret() {
    return this._clientSecret;
  }

  set clientSecret(value) {
    this._clientSecret = value;
  }

  get username() {
    return this._username;
  }

  set username(value) {
    this._username = value;
  }

  get password() {
    return this._password;
  }

  set password(value) {
    this._password = value;
  }

  get environment() {
    return this._environment;
  }

  set environment(value) {
    this._environment = value;
  }

  centralizedKeys() {
    return this.username === null || this.password === null;
  }
}
module.exports = Credentials;
