const Request = require('../http/Request');
const ApiException = require('../exceptions/ApiException');
const Ensure = require('../helpers/Ensure');

/**
 * A client for Events API.
 * @class EventsClient
 */
class EventsClient {
  static _version() {
    return '1.8.2';
  }

  /**
   * Instantiate a new Events API Client
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
   * Register a new initialization event.
   * This event represents the startup of the reception system.
   * @param version an object with all possible information about the device and reception app
   * @param restaurant restaurant id or restaurant code when using centralized keys
   * @return {Promise.<void>}
   */
  async initialization(version, restaurant = null) {
    Ensure.argumentNotNullOrEmptyObject(version, 'version');
    if (this._connection.credentials.centralizedKeys() && restaurant === null) {
      throw new Error('You must specify a restaurantCode or restaurantId');
    }

    if (typeof restaurant === 'string') {
      Ensure.argumentNotNullOrEmptyString(restaurant, 'restaurant');
      await this._sendInitialization(version, null, restaurant);
    } else if (typeof restaurant === 'number') {
      Ensure.greaterThanZero(restaurant, 'restaurant');
      await this._sendInitialization(version, restaurant);
    } else {
      await this._sendInitialization(version);
    }
  }

  /**
   * Register a new heart beat event.
   * This event represents that the reception system it's alive and ready to receive orders.
   * @param restaurant restaurant id or restaurant code when using centralized keys
   * @return {Promise.<void>}
   */
  async heartBeat(restaurant = null) {
    if (this._connection.credentials.centralizedKeys() && restaurant === null) {
      throw new Error('You must specify a restaurantCode or restaurantId');
    }

    if (typeof restaurant === 'string') {
      Ensure.argumentNotNullOrEmptyString(restaurant, 'restaurant');
      await this._sendHeartbeat(null, restaurant);
    } else if (typeof restaurant === 'number') {
      Ensure.greaterThanZero(restaurant, 'restaurant');
      await this._sendHeartbeat(restaurant);
    } else {
      await this._sendHeartbeat();
    }
  }

  /**
   * Register a reception event.
   * This event represents that the order has arrived.
   * @param orderId id of the order that has been received.
   * @param restaurant restaurant id or restaurant code when using centralized keys
   * @return {Promise.<void>}
   */
  async reception(orderId, restaurant = null) {
    Ensure.greaterThanZero(orderId, 'orderId');
    if (this._connection.credentials.centralizedKeys() && restaurant === null) {
      throw new Error('You must specify a restaurantCode or restaurantId');
    }

    if (typeof restaurant === 'string') {
      Ensure.argumentNotNullOrEmptyString(restaurant, 'restaurant');
      await this._sendReception(orderId, null, restaurant);
    } else if (typeof restaurant === 'number') {
      Ensure.greaterThanZero(restaurant, 'restaurant');
      await this._sendReception(orderId, restaurant);
    } else {
      await this._sendReception(orderId);
    }
  }

  /**
   * Register an order acknowledgement event
   * This event represents the order was seen by a restaurant operator
   * @param orderId id of the order that has been seen.
   * @param restaurant restaurant id or restaurant code when using centralized keys
   * @return {Promise.<void>}
   */
  async acknowledgement(orderId, restaurant = null) {
    Ensure.greaterThanZero(orderId, 'orderId');

    if (this._connection.credentials.centralizedKeys() && restaurant === null) {
      throw new Error('You must specify a restaurantCode or restaurantId');
    }

    if (typeof restaurant === 'string') {
      Ensure.argumentNotNullOrEmptyString(restaurant, 'restaurant');
      await this._sendAcknowledgement(orderId, null, restaurant);
    } else if (typeof restaurant === 'number') {
      Ensure.greaterThanZero(restaurant, 'restaurant');
      await this._sendAcknowledgement(orderId, restaurant);
    } else {
      await this._sendAcknowledgement(orderId);
    }
  }

  /**
   * Register a order state change event.
   * This event represents that a state change of the order must be done.
   * @param orderId id of the order.
   * @param orderState new state of the order
   * @param restaurant restaurant id or restaurant code when using centralized keys
   * @return {Promise.<void>}
   */
  async stateChange(orderId, orderState, restaurant = null) {
    Ensure.greaterThanZero(orderId, 'orderId');
    Ensure.argumentNotNullOrEmptyString(orderState, 'orderState');

    if (this._connection.credentials.centralizedKeys() && restaurant === null) {
      throw new Error('You must specify a restaurantCode or restaurantId');
    }

    if (typeof restaurant === 'string') {
      Ensure.argumentNotNullOrEmptyString(restaurant, 'restaurant');
      await this._sendStateChange(orderId, orderState, null, restaurant);
    } else if (typeof restaurant === 'number') {
      Ensure.greaterThanZero(restaurant, 'restaurant');
      await this._sendStateChange(orderId, orderState, restaurant);
    } else {
      await this._sendStateChange(orderId, orderState);
    }
  }

  /**
   * Register a warning event.
   * This event represents a warning, for example: low battery, lack of paper, etc.
   * @param eventCode code of the event
   * @param eventDescription a brief description of the event
   * @param restaurant restaurant id or restaurant code when using centralized keys
   * @return {Promise.<void>}
   */
  async warning(eventCode, eventDescription, restaurant = null) {
    Ensure.argumentNotNullOrEmptyString(eventCode, 'eventCode');
    Ensure.argumentNotNullOrEmptyString(eventDescription, 'eventDescription');

    if (this._connection.credentials.centralizedKeys() && restaurant === null) {
      throw new Error('You must specify a restaurantCode or restaurantId');
    }

    if (typeof restaurant === 'string') {
      Ensure.argumentNotNullOrEmptyString(restaurant, 'restaurant');
      await this._sendWarning(eventCode, eventDescription, null, restaurant);
    } else if (typeof restaurant === 'number') {
      Ensure.greaterThanZero(restaurant, 'restaurant');
      await this._sendWarning(eventCode, eventDescription, restaurant);
    } else {
      await this._sendWarning(eventCode, eventDescription);
    }
  }

  /**
   * Register an error event.
   * This event represents a error, for example: missing product code, can't confirm order, error processing orders.
   * @param eventCode code of the event
   * @param eventDescription a brief description of the event
   * @param restaurant restaurant id or restaurant code when using centralized keys
   * @return {Promise.<void>}
   */
  async error(eventCode, eventDescription, restaurant = null) {
    Ensure.argumentNotNullOrEmptyString(eventCode, 'eventCode');
    Ensure.argumentNotNullOrEmptyString(eventDescription, 'eventDescription');

    if (this._connection.credentials.centralizedKeys() && restaurant === null) {
      throw new Error('You must specify a restaurantCode or restaurantId');
    }

    if (typeof restaurant === 'string') {
      Ensure.argumentNotNullOrEmptyString(restaurant, 'restaurant');
      await this._sendError(eventCode, eventDescription, null, restaurant);
    } else if (typeof restaurant === 'number') {
      Ensure.greaterThanZero(restaurant, 'restaurant');
      await this._sendError(eventCode, eventDescription, restaurant);
    } else {
      await this._sendError(eventCode, eventDescription);
    }
  }

  async _sendInitialization(version, restaurantId = null, restaurantCode = null) {
    if (version instanceof Object) {
      version.sdk = 'node-' + EventsClient._version();
    }

    let versionList = [];
    for (let key in version) {
      if ({}.hasOwnProperty.call(version, key)) {
        versionList.push(key + '=' + version[key]);
      }
    }

    let data = {
      version: versionList.join('|'),
      restaurant: {},
      action: 'INITIALIZATION'
    };
    if (restaurantId !== null) {
      data.restaurant.id = restaurantId;
    }
    if (restaurantCode !== null) {
      data.restaurant.code = restaurantCode.trim();
    }
    await this._event(data);
  }

  async _sendHeartbeat(restaurantId = null, restaurantCode = null) {
    let data = {
      restaurant: {},
      action: 'HEART_BEAT'
    };
    if (restaurantId !== null) {
      data.restaurant.id = restaurantId;
    }
    if (restaurantCode !== null) {
      data.restaurant.code = restaurantCode.trim();
    }
    await this._event(data);
  }

  async _sendReception(orderId, restaurantId = null, restaurantCode = null) {
    let data = {
      order: orderId,
      restaurant: {},
      action: 'RECEPTION'
    };
    if (restaurantId !== null) {
      data.restaurant.id = restaurantId;
    }
    if (restaurantCode !== null) {
      data.restaurant.code = restaurantCode.trim();
    }
    await this._event(data);
  }

  async _sendAcknowledgement(orderId, restaurantId = null, restaurantCode = null) {
    let data = {
      order: orderId,
      restaurant: {},
      action: 'ACKNOWLEDGEMENT'
    };
    if (restaurantId !== null) {
      data.restaurant.id = restaurantId;
    }
    if (restaurantCode !== null) {
      data.restaurant.code = restaurantCode.trim();
    }
    await this._event(data);
  }

  async _sendStateChange(
    orderId,
    orderState,
    restaurantId = null,
    restaurantCode = null
  ) {
    let data = {
      order: orderId,
      state: orderState,
      restaurant: {},
      action: 'STATE_CHANGE'
    };
    if (restaurantId !== null) {
      data.restaurant.id = restaurantId;
    }
    if (restaurantCode !== null) {
      data.restaurant.code = restaurantCode.trim();
    }
    await this._event(data);
  }

  async _sendWarning(
    eventCode,
    eventDescription,
    restaurantId = null,
    restaurantCode = null
  ) {
    let data = {
      event: eventCode,
      description: eventDescription,
      restaurant: {},
      action: 'WARNING'
    };
    if (restaurantId !== null) {
      data.restaurant.id = restaurantId;
    }
    if (restaurantCode !== null) {
      data.restaurant.code = restaurantCode.trim();
    }
    await this._event(data);
  }

  async _sendError(
    eventCode,
    eventDescription,
    restaurantId = null,
    restaurantCode = null
  ) {
    let data = {
      event: eventCode,
      description: eventDescription,
      restaurant: {},
      action: 'ERROR'
    };
    if (restaurantId !== null) {
      data.restaurant.id = restaurantId;
    }
    if (restaurantCode !== null) {
      data.restaurant.code = restaurantCode.trim();
    }
    await this._event(data);
  }

  async _event(data) {
    try {
      let request = new Request();
      request.endpoint = 'events';
      request.body = data;

      let response = await this._connection.post(request);
      if (response.statusCode !== 200) {
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
module.exports = EventsClient;
