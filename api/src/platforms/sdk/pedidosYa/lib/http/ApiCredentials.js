const Credentials = require('./Credentials');

/**
 * Internal service credentials for accessing API
 * @class ApiCredentials
 */
class ApiCredentials extends Credentials {
  constructor(credentials) {
    super();
    this.clientId = credentials.clientId;
    this.clientSecret = credentials.clientSecret;
    this.username = credentials.username;
    this.password = credentials.password;
    this.environment = credentials.environment;

    /**
     * Push method access key
     * @type {String}
     */
    this.orderAccessKey = null;

    /**
     * Push method secret key
     * @type {String}
     */
    this.orderSecretKey = null;

    /**
     * Push method environment
     * @type {String}
     */
    this.regionEndpoint = null;

    /**
     * Push method orders queue
     * @type {String}
     */
    this.queueName = null;
  }

  /**
   * Check if the credentials are allowed to use the push receiving metho
   * @return {boolean}
   */
  pushAvailable() {
    return !(
      this.orderAccessKey === null ||
      this.orderSecretKey === null ||
      this.regionEndpoint === null ||
      this.queueName === null
    );
  }
}
module.exports = ApiCredentials;
