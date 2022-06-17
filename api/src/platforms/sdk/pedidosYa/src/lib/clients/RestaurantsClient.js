const Request = require('../http/Request');
const ApiException = require('../exceptions/ApiException');
const RestaurantState = require('./../models/RestaurantState');
const DateUtil = require('./../utils/DateUtil');
const Ensure = require('../helpers/Ensure');

/**
 * A client for Restaurants API.
 * @class RestaurantsClient
 */
class RestaurantsClients {
  /**
   * Instantiate a new Restaurants API Client
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
   * Returns all the possible restaurants inside the pagination defined
   * @param {PaginationOptions} options
   * @param {String} code
   * @return {Promise.<void>}
   * @throws {ApiException}
   */
  async getAll(options, code = '') {
    try {
      let request = new Request();
      request.endpoint = 'restaurants';
      request.parameters = {
        offset: options.offset,
        limit: options.limit
      };
      if (code.length > 0) {
        request.parameters.code = code;
      }

      let response = await this._connection.get(request);
      if (response.statusCode === 200) {
        return response.body.data;
      }
      throw ApiException.buildFromResponse(response);
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }
      throw new ApiException(error.message);
    }
  }

  /**
   * Close a restaurant with a date range in restaurant's country timezone
   * @param id the restaurant to close
   * @param from the init date on which it will be closed
   * @param to the end date on which it will be closed
   * @param reason the reason for the closure
   * @return {Promise.<void>}
   */
  async close(id, from, to, reason) {
    try {
      Ensure.greaterThanZero(id, 'id');
      Ensure.validDateFormat(from, 'from');
      Ensure.validDateFormat(to, 'to');
      Ensure.firstDateBeforeSecond(from, to, 'from', 'to');
      Ensure.argumentNotNullOrEmptyString(reason, 'reason');

      let body = {
        state: RestaurantState.OFFLINE,
        from: DateUtil.formatDate(from),
        to: DateUtil.formatDate(to),
        reason: reason
      };

      let request = new Request();
      request.endpoint = 'restaurants/' + id;
      request.body = body;
      let response = await this._connection.put(request);
      if (response.statusCode === 200) {
        return response.body;
      }
      throw ApiException.buildFromResponse(response);
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }
      throw new ApiException(error.message);
    }
  }

  /**
   * Open a restaurant from a date (previously closed with the close operation)
   * @param id the restaurant to open
   * @param from the date on which it will re-open
   * @return {Promise.<void>}
   * @throws {ApiException}
   */
  async open(id, from) {
    try {
      Ensure.greaterThanZero(id, 'id');
      Ensure.validDateFormat(from, 'from');

      let body = {
        state: RestaurantState.ONLINE,
        from: DateUtil.formatDate(from)
      };

      let request = new Request();
      request.endpoint = 'restaurants/' + id;
      request.body = body;
      let response = await this._connection.put(request);
      if (response.statusCode === 200) {
        return response.body;
      }
      throw ApiException.buildFromResponse(response);
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }
      throw new ApiException(error.message);
    }
  }
}
module.exports = RestaurantsClients;
