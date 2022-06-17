const DeliveryTimesClient = require('./DeliveryTimesClient');
const RejectMessagesClient = require('./RejectMessagesClient');
const ApiException = require('./../exceptions/ApiException');
const Ensure = require('./../helpers/Ensure');
const Request = require('./../http/Request');
const OrderState = require('./../models/OrderState');
const PaginationOptions = require('./../utils/PaginationOptions');
const AWS = require('aws-sdk');
const SQSConsumer = require('sqs-consumer');
let schedule = require('node-schedule');

/**
 * A client for Orders API.
 * @class OrdersClient
 */
class OrdersClient {
  static _WAIT_TIME_SECONDS() {
    return 20;
  }

  static _POLL_TIME_SECONDS() {
    return 10;
  }

  static _MAX_RETRIES() {
    return 5;
  }

  static _MAX_NUMBER_OF_MESSAGES() {
    return 10;
  }

  static _CONFIRM() {
    return 2;
  }

  static _REJECT() {
    return 3;
  }

  constructor(connection) {
    this._timestamp = 0;
    this._connection = connection;

    /**
     * Client for the DeliveryTimes API
     */
    this._deliveryTime = new DeliveryTimesClient(this._connection);

    /**
     * Client for the RejectMessages API
     */
    this._rejectMessage = new RejectMessagesClient(this._connection);
  }

  /**
   * Returns an operational order by it's id
   * @param id The order identification number
   * @return {Promise.<void>} the order with the specified id
   * @throws {ApiException}
   */
  async get(id) {
    try {
      let request = new Request();
      request.endpoint = 'orders/' + id;
      let response = await this._connection.get(request);
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
   * Listen for new orders. This will return new and orders updates
   * @param {OrderState} state
   * @param {PaginationOptions} options
   * @param {function} onSuccess
   * @param {function} onError
   * @return {Promise.<*>}
   * @throws {ApiException}
   */
  async getAll(state, options, onSuccess = null, onError = null) {
    if (!this._connection.isAuthenticated()) {
      await this._connection.authenticate();
    }
    if (state !== OrderState.PENDING && !(options instanceof PaginationOptions)) {
      throw new Error('options is mandatory for a state different to PENDING');
    }
    if (this._connection.credentials.pushAvailable()) {
      if (state === OrderState.PENDING) {
        throw new ApiException(
          'Cannot get PENDING orders from this method using this kind of credentials'
        );
      } else {
        this._pushOrders(onSuccess, onError);
      }
    } else if (typeof onSuccess === 'function' && typeof onError === 'function') {
      this._pollOrders(onSuccess, onError);
    } else {
      let orders = await this._loadOrders(state, options);
      return orders;
    }
  }

  /**
   * Confirm a pending order. This method must be called when the restaurant accepts the order.
   * @param order
   * @param deliveryTime
   * @return {Promise}
   */
  async confirm(order, deliveryTime = null) {
    let orderId = Number.isInteger(order) ? order : order.id;
    let deliveryTimeId = 0;
    if (deliveryTime !== null) {
      deliveryTimeId = Number.isInteger(deliveryTime) ? deliveryTime : deliveryTime.id;
    }
    return this.update(orderId, OrdersClient._CONFIRM(), deliveryTimeId, 0, false, null);
  }

  /**
   * Reject a pending order. This method must be called when the restaurant cannot accept the order.
   * @param order
   * @param rejectMessage
   * @param rejectNote
   * @return {Promise}
   */
  async reject(order, rejectMessage, rejectNote = null) {
    let orderId = Number.isInteger(order) ? order : order.id;
    let rejectMessageId = Number.isInteger(rejectMessage)
      ? rejectMessage
      : rejectMessage.id;

    return this.update(
      orderId,
      OrdersClient._REJECT(),
      0,
      rejectMessageId,
      false,
      rejectNote
    );
  }

  /**
   * Retrieves the OrderTracking given an orderId for logistic orders
   * @param orderId
   * @return {Promise}
   * @throws {ApiException}
   */
  async tracking(orderId) {
    try {
      Ensure.greaterThanZero(orderId, 'orderId');

      let request = new Request();
      request.endpoint = 'orders/' + orderId + '/tracking';
      let response = await this._connection.get(request);
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
   * Dispatch an order. This method must be called when the restaurant is ready to deliver the order.
   * @param order
   * @return {Promise}
   */
  async dispatch(order) {
    let orderId = Number.isInteger(order) ? order : order.id;

    return this.update(orderId, 0, 0, 0, true, null);
  }

  async update(id, state, deliveryTimeId, rejectMessageId, dispatched, rejectNote) {
    try {
      let request = new Request();
      request.endpoint = 'orders/' + id;

      let body = {};
      if (dispatched) {
        body.dispatched = true;
      } else {
        body.state = state;
        if (state === OrdersClient._CONFIRM()) {
          if (deliveryTimeId) {
            body.deliveryTimeId = deliveryTimeId;
          }
        } else if (state === OrdersClient._REJECT()) {
          body.rejectMessageId = rejectMessageId;
          if (rejectNote !== null) {
            body.notes = rejectNote;
          }
        }
      }
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

  async _loadOrders(state, options) {
    try {
      let request = new Request();
      request.endpoint = 'orders';
      let pendingState = state === OrderState.PENDING;
      if (pendingState) {
        request.parameters.timestamp = this._timestamp;
      } else {
        request.parameters.state = state;
        request.parameters.offset = options.offset;
        request.parameters.limit = options.limit;
      }
      let response = await this._connection.get(request);
      if (response.statusCode === 200) {
        let orders = response.body.data;
        if (pendingState && orders.length) {
          this._timestamp = Math.max.apply(
            Math,
            orders.map(function(order) {
              return order.timestamp;
            })
          );
        }
        return orders;
      }
      throw ApiException.buildFromResponse(response);
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }
      throw new ApiException(error.message);
    }
  }

  async _loadOrdersFromQueue(onSuccess, onError) {
    try {
      let apiCredentials = this._connection.credentials;
      AWS.config.update({
        accessKeyId: apiCredentials.orderAccessKey,
        secretAccessKey: apiCredentials.orderSecretKey,
        region: apiCredentials.regionEndpoint
      });
      let sqs = new AWS.SQS();
      let queueUrl = await sqs
        .getQueueUrl({ QueueName: apiCredentials.queueName })
        .promise();
      let consumer = SQSConsumer.create({
        queueUrl: queueUrl.QueueUrl,
        batchSize: OrdersClient._MAX_NUMBER_OF_MESSAGES(),
        authenticationErrorTimeout: 1000,
        waitTimeSeconds: OrdersClient._WAIT_TIME_SECONDS(),
        attributeNames: ['ApproximateReceiveCount'],
        handleMessage: function(message, done) {
          try {
            if (
              message.Attributes &&
              message.Attributes.ApproximateReceiveCount >= OrdersClient._MAX_RETRIES()
            ) {
              done(); // Delete message
            } else {
              let order = JSON.parse(message.Body);
              let processed = onSuccess(order);
              if (processed) {
                return done();
              }
              return done(new Error('Returned false from onSuccess'));
            }
          } catch (error) {
            onError(new ApiException(error.message));
            return done(error);
          }
        },
        sqs: sqs
      });
      consumer.on('error', function(error) {
        onError(new ApiException(error.message));
      });
      consumer.start();
    } catch (error) {
      console.log(error);
    }
  }

  _pollOrders(onSuccess, onError) {
    schedule.scheduleJob(
      '*/' + OrdersClient._POLL_TIME_SECONDS() + ' * * * * *',
      async () => {
        try {
          let orders = await this._loadOrders(
            OrderState.PENDING,
            PaginationOptions.create()
          );
          orders.forEach(function(order) {
            onSuccess(order);
          });
        } catch (error) {
          if (error instanceof ApiException) {
            onError(error);
          } else {
            onError(new ApiException(error.message));
          }
        }
      }
    );
  }

  _pushOrders(onSuccess, onError) {
    this._loadOrdersFromQueue(onSuccess, onError);
  }

  /**
   * Returns the client for the Delivery Times API
   * @return {DeliveryTimesClient}
   */
  get deliveryTime() {
    return this._deliveryTime;
  }

  /**
   * Returns the client for the Reject Messages API
   * @return {RejectMessagesClient}
   */
  get rejectMessage() {
    return this._rejectMessage;
  }

  async getTaxes(productIntegrationCodes, restaurantId) {
    try {
      let request = new Request();
      request.endpoint = this._connection._ismsUrl() + 'v1/product/taxes';
      request.body = JSON.stringify(productIntegrationCodes);
      request.headers = Object.assign(request.headers, {
        'Peya-Partner-Id': restaurantId
      });
      let response = await this._connection.post(request);
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

  async reconcile(reconciliation, restaurantId) {
    Ensure.argumentNotNull(reconciliation, 'reconciliation');
    Ensure.greaterThanZero(restaurantId, 'restaurantId');
    try {
      let request = new Request();
      request.endpoint = `${this._connection._iosUrl()}v1/orders/${
        reconciliation.id
      }/reconcile`;
      request.headers = Object.assign(request.headers, {
        'Peya-Partner-Id': restaurantId,
        'Peya-Reception-System-Code': this._connection.credentials.clientId
      });
      request.timeout = 1000000;
      let body = await JSON.stringify(reconciliation);
      request.body = body;
      let response = await this._connection.post(request);
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

  async checkout(orderId, restaurantId) {
    Ensure.greaterThanZero(orderId, 'orderId');
    Ensure.greaterThanZero(restaurantId, 'orderId');
    try {
      let request = new Request();
      request.endpoint = `${this._connection._iosUrl()}v1/orders/${orderId}/checkout`;
      request.headers = Object.assign(request.headers, {
        'Peya-Partner-Id': restaurantId,
        'Peya-Reception-System-Code': this._connection.credentials.clientId
      });
      request.timeout = 1000000;
      let response = await this._connection.post(request);
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

  async foodIsReady(orderId, restaurantId) {
    Ensure.greaterThanZero(orderId, 'orderId');
    Ensure.greaterThanZero(restaurantId, 'restaurantId');
    try {
      let request = new Request();
      request.endpoint = `${this._connection._iosUrl()}v1/orders/${orderId}/preparation-completion`;
      request.headers = Object.assign(request.headers, {
        'Peya-Partner-Id': restaurantId,
        'Peya-Reception-System-Code': this._connection.credentials.clientId
      });
      request.timeout = 100000;
      let response = await this._connection.post(request);
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

module.exports = OrdersClient;
