const Request = require('../http/Request');
const ApiException = require('../exceptions/ApiException');
const Ensure = require('../helpers/Ensure');

/**
 * A client for Reject Messages API.
 * @class RejectMessagesClient
 */
class RejectMessagesClient {
  /**
   * Instantiate a new Reject Messages API client.
   * @param {ApiConnection} connection
   */
  constructor(connection) {
    Ensure.argumentNotNull(connection, 'connection');

    /**
     * An API connection
     * @type {ApiConnection}
     */
    this._connection = connection;
  }

  /**
   * Returns all the possible reject messages
   * @return {List} The list of reject messages
   * @throws {ApiException}
   */
  async getAll() {
    try {
      let request = new Request();
      request.endpoint = 'rejectMessages';
      let response = await this._connection.get(request);
      if (response.statusCode === 200) {
        let body = response.body;
        if (body.data.length === body.total) {
          return body.data;
        }
        let rejectMessages = [];
        rejectMessages = rejectMessages.concat(body.data);
        while (body.data !== null && body.data.length !== 0) {
          request.parameters.offset = rejectMessages.length;
          response = await this._connection.get(request);
          if (response.statusCode === 200) {
            body = response.body;
            rejectMessages = rejectMessages.concat(body.data);
          } else {
            throw ApiException.buildFromResponse(response);
          }
        }
        return rejectMessages;
      } else {
        throw ApiException.buildFromResponse(response);
      }
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }
      throw new ApiException(error.message);
    }
  }
}
module.exports = RejectMessagesClient;
