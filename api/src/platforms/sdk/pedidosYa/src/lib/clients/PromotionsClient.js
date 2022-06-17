const MenuItemClient = require('../clients/MenuItemClient');
const Ensure = require('../helpers/Ensure');
const ApiException = require('./../exceptions/ApiException');
const Request = require('./../http/Request');
const version = '1.8.2';

class PromotionClient {
  constructor(connection) {
    Ensure.argumentNotNull(connection, 'connection');
    this._connection = connection;
  }

  async create(promotion, partnerId) {
    try {
      const request = new Request();
      request.endpoint = this._connection._ismsUrl() + `promotion`;
      request.headers = Object.assign(request.headers, {
        'Peya-Partner-Id': partnerId,
        'Peya-Reception-System-Code': this._connection.credentials.clientId,
        'Peya-Sdk-Version': version
      });
      request.timeout = 1000000;
      const body = promotion;
      request.body = JSON.stringify(body);
      const response = await this._connection.post(request);
      if (response.statusCode != 200) {
        throw ApiException.buildFromResponse(response);
      }
      return response.body;
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }
      throw new ApiException(error.message);
    }
  }

  async get(promotionId, partnerId) {
    try {
      const request = new Request();
      request.endpoint = this._connection._ismsUrl() + `promotion/${promotionId}`;
      request.headers = Object.assign(request.headers, {
        'Peya-Partner-Id': partnerId,
        'Peya-Reception-System-Code': this._connection.credentials.clientId,
        'Peya-Sdk-Version': version
      });
      request.timeout = 1000000;
      const response = await this._connection.get(request);
      if (response.statusCode != 200) {
        throw ApiException.buildFromResponse(response);
      }
      return response.body;
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }
      throw new ApiException(error.message);
    }
  }

  async update(promotion, promotionId, partnerId) {
    try {
      const request = new Request();
      request.endpoint = this._connection._ismsUrl() + `promotion/${promotionId}`;
      request.headers = Object.assign(request.headers, {
        'Peya-Partner-Id': partnerId,
        'Peya-Reception-System-Code': this._connection.credentials.clientId,
        'Peya-Sdk-Version': version
      });
      request.timeout = 1000000;
      const body = promotion;
      request.body = JSON.stringify(body);
      const response = await this._connection.put(request);
      if (response.statusCode != 200) {
        throw ApiException.buildFromResponse(response);
      }
      return response.body;
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }
      throw new ApiException(error.message);
    }
  }

  async delete(promotionId, partnerId) {
    try {
      const request = new Request();
      request.endpoint = this._connection._ismsUrl() + `promotion/${promotionId}`;
      request.headers = Object.assign(request.headers, {
        'Peya-Partner-Id': partnerId,
        'Peya-Reception-System-Code': this._connection.credentials.clientId,
        'Peya-Sdk-Version': version
      });
      request.timeout = 1000000;
      const response = await this._connection.delete(request);
      if (response.statusCode !== 204) {
        throw ApiException.buildFromResponse(response);
      }
      return true;
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }
      throw new ApiException(error.message);
    }
  }
}

module.exports = PromotionClient;
