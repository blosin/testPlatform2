const Response = require('./Response');
const axios = require('axios');

/**
 * HTTP generic REST client
 * @class Connection
 */
class Connection {
  /**
   * Instantiate a new Connection
   * @param {String} baseUrl
   */
  constructor(baseUrl) {
    /**
     * The service base url
     */
    this._baseUrl = baseUrl;
  }

  /**
   * Call a generic HTTP GET
   * @param {Request} request
   * @return {Response}
   * @throws {Error}
   */
  async get(request) {
    try {
      let httpClient = this._buildHttpClient(request);
      const restResponse = await httpClient.get(request.endpoint);
      return this._buildResponse(restResponse);
    } catch (error) {
      if (error.response) {
        return this._buildResponse(error.response);
      }
      throw new Error(error.message);
    }
  }

  /**
   * Call a generic HTTP POST
   * @param {Request} request
   * @return {Response} response
   */
  async post(request) {
    try {
      let httpClient = this._buildHttpClient(request);
      const restResponse = await httpClient.post(request.endpoint, request.body);
      return this._buildResponse(restResponse);
    } catch (error) {
      if (error.response) {
        return this._buildResponse(error.response);
      }
      throw new Error(error.message);
    }
  }

  /**
   * Call a generic HTTP PUT
   * @param {Request} request
   * @return {Response} response
   */
  async put(request) {
    try {
      let httpClient = this._buildHttpClient(request);
      const restResponse = await httpClient.put(request.endpoint, request.body);
      return this._buildResponse(restResponse);
    } catch (error) {
      if (error.response) {
        return this._buildResponse(error.response);
      }
      throw new Error(error.message);
    }
  }

  /**
   * Call a generic HTTP DELETE
   * @param {Request} request
   * @return {Response} response
   */
  async delete(request) {
    try {
      let httpClient = this._buildHttpClient(request);
      const restResponse = await httpClient.delete(request.endpoint, request.body);
      return this._buildResponse(restResponse);
    } catch (error) {
      if (error.response) {
        return this._buildResponse(error.response);
      }
      throw new Error(error.message);
    }
  }

  _buildResponse(restResponse) {
    let response = new Response();
    response.content = JSON.stringify(restResponse.data);
    response.statusCode = restResponse.status;
    response.body = restResponse.data;
    return response;
  }

  _buildHttpClient(request) {
    return axios.create({
      baseURL: this._baseUrl,
      timeout: request.timeout,
      headers: request.headers,
      params: request.parameters,
      data: request.body
    });
  }
}
module.exports = Connection;
