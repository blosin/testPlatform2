const ApiException = require('./../exceptions/ApiException');
const Request = require('./../http/Request');
const Ensure = require('../helpers/Ensure');

class MenuItemClient {
  /**
   * Instantiate a new Menu API Client
   * @param {ApiConnection} connection
   * @param {String} itemUrl
   */
  constructor(connection, itemUrl) {
    if (new.target === MenuItemClient) {
      throw new TypeError('Cannot construct MenuItemClient instances directly');
    }

    this._connection = connection;
    this._itemUrl = itemUrl;
  }

  async enable(integrationCode, restaurant) {
    if (this._connection.credentials.centralizedKeys() && restaurant === null) {
      throw new Error('You must specify a restaurantCode or restaurantId');
    }

    if (typeof restaurant === 'string') {
      Ensure.argumentNotNullOrEmptyString(restaurant, 'restaurant');
      return this._update(integrationCode, null, restaurant, null, true);
    }
    if (typeof restaurant === 'number') {
      Ensure.greaterThanZero(restaurant, 'restaurant');
      return this._update(integrationCode, restaurant, null, null, true);
    }
    return this._update(integrationCode, null, null, null, true);
  }

  async disable(integrationCode, restaurant) {
    if (this._connection.credentials.centralizedKeys() && restaurant === null) {
      throw new Error('You must specify a restaurantCode or restaurantId');
    }

    if (typeof restaurant === 'string') {
      Ensure.argumentNotNullOrEmptyString(restaurant, 'restaurant');
      return this._update(integrationCode, null, restaurant, null, false);
    }
    if (typeof restaurant === 'number') {
      Ensure.greaterThanZero(restaurant, 'restaurant');
      return this._update(integrationCode, restaurant, null, null, false);
    }
    return this._update(integrationCode, null, null, null, false);
  }

  async price(integrationCode, price, restaurant) {
    Ensure.greaterOrEqualsThanZero(price, 'price');

    if (this._connection.credentials.centralizedKeys() && restaurant === null) {
      throw new Error('You must specify a restaurantCode or restaurantId');
    }

    if (typeof restaurant === 'string') {
      Ensure.argumentNotNullOrEmptyString(restaurant, 'restaurant');
      return this._update(integrationCode, null, restaurant, price, null);
    }
    if (typeof restaurant === 'number') {
      Ensure.greaterThanZero(restaurant, 'restaurant');
      return this._update(integrationCode, restaurant, null, price, null);
    }
    return this._update(integrationCode, null, null, price, null);
  }

  async _update(
    integrationCode,
    restaurantId = null,
    restaurantCode = null,
    price = null,
    enabled = null
  ) {
    try {
      Ensure.argumentNotNullOrEmptyString(integrationCode, 'integrationCode');
      let body = { restaurant: {} };
      if (restaurantId !== null) {
        body.restaurant.id = restaurantId;
      }
      if (restaurantCode !== null) {
        body.restaurant.code = restaurantCode;
      }
      if (price !== null) {
        body.price = price;
      }
      if (enabled !== null) {
        body.enabled = enabled;
      }

      let request = new Request();
      request.endpoint = this._itemUrl + '/' + integrationCode.trim();
      request.body = body;

      let response = await this._connection.put(request);
      if (response.statusCode === 200) {
        return true;
      }
      throw ApiException.buildFromResponse(response);
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }
      throw new ApiException(error.message);
    }
  }

  async create(product, restaurant = null) {
    if (this._connection.credentials.centralizedKeys() && restaurant === null) {
      throw new Error('You must specify a restaurantCode or restaurantId');
    }
    if (typeof restaurant === 'string') {
      Ensure.argumentNotNullOrEmptyString(restaurant, 'restaurant');
      return this._create(product, restaurant, null);
    }
    if (typeof restaurant === 'number') {
      Ensure.greaterThanZero(restaurant, 'restaurant');
      return this._create(product, null, restaurant);
    } else {
      return this._create(product, null, null);
    }
  }

  async _create(product, restaurantCode, restaurantId) {
    try {
      let body = { restaurant: {} };
      if (restaurantId !== null) {
        body.restaurant.id = restaurantId;
      }
      if (restaurantCode !== null) {
        body.restaurant.code = restaurantCode;
      }
      if (product !== null) {
        body.name = product.name;
        body.description = product.description;
        body.integrationCode = product.integrationCode;
        body.integrationName = product.integrationName;
        body.section = product.section;
        body.image = product.image;
        body.price = product.price;
      }
      let request = new Request();
      request.endpoint = this._itemUrl;
      request.body = body;

      let response = await this._connection.post(request);
      if (response.statusCode === 200) {
        return true;
      }
      throw ApiException.buildFromResponse(response);
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }
      throw new ApiException(error.message);
    }
  }

  async modify(product, restaurant = null) {
    if (this._connection.credentials.centralizedKeys() && restaurant === null) {
      throw new Error('You must specify a restaurantCode or restaurantId');
    }
    if (typeof restaurant === 'string') {
      Ensure.argumentNotNullOrEmptyString(restaurant, 'restaurant');
      return this._modify(product, restaurant, null);
    }
    if (typeof restaurant === 'number') {
      Ensure.greaterThanZero(restaurant, 'restaurant');
      return this._modify(product, null, restaurant);
    } else {
      return this._modify(product, null, null);
    }
  }

  async _modify(product, restaurantCode, restaurantId) {
    try {
      let body = { restaurant: {} };
      if (restaurantId !== null) {
        body.restaurant.id = restaurantId;
      }
      if (restaurantCode !== null) {
        body.restaurant.code = restaurantCode;
      }
      if (product !== null) {
        body.integrationCode = product.integrationCode;
        if (product.name !== null) {
          body.name = product.name;
        }
        if (product.description !== null) {
          body.description = product.description;
        }
        if (product.image !== null) {
          body.image = product.image;
        }
        if (product.price !== null) {
          body.price = product.price;
        }
      }
      let request = new Request();
      request.endpoint = this._itemUrl;
      request.body = body;

      let response = await this._connection.put(request);
      if (response.statusCode === 200) {
        return true;
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
module.exports = MenuItemClient;
