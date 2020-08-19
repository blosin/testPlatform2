const Request = require('../http/Request');
const ApiException = require('../exceptions/ApiException');
const Ensure = require('../helpers/Ensure');

/**
 * A client for Delivery Times API.
 * @class DeliveryTimesClient
 */
class DeliveryTimesClient {
  /**
   * Instantiate a new Delivery Times API Client
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
   * Returns all the possible delivery times
   * @return The list of delivery times
   * @throws {ApiException}
   */
  async getAll() {
    try {
      let request = new Request();
      request.endpoint = 'deliveryTimes';
      let response = await this._connection.get(request);
      if (response.statusCode === 200) {
        let body = response.body;
        if (body.data.length === body.total) {
          return body.data;
        }
        let deliveryTimes = [];
        deliveryTimes = deliveryTimes.concat(body.data);
        while (body.data !== null && body.data.length !== 0) {
          request.parameters.offset = deliveryTimes.length;
          response = await this._connection.get(request);
          if (response.statusCode === 200) {
            body = response.body;
            deliveryTimes.concat(body.data);
          } else {
            throw ApiException.buildFromResponse(response);
          }
        }
        return deliveryTimes;
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
module.exports = DeliveryTimesClient;
