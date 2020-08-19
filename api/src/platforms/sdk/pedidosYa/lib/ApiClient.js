const ApiConnection = require('./http/ApiConnection');
const OrdersClient = require('./clients/OrdersClient');
const MenusClient = require('./clients/MenusClient');
const EventsClient = require('./clients/EventsClients');
const RestaurantsClient = require('./clients/RestaurantsClient');

/**
 * A client for the PedidosYa API
 * @class ApiClient
 */
class ApiClient {
  constructor(credentials) {
    /**
     * Provides a client connection to make rest requests to HTTP endpoints.
     * @type ApiConnection
     */
    this._connection = new ApiConnection(credentials);

    /**
     * Client for the Orders API
     * @type OrdersClient
     */
    this._ordersClient = new OrdersClient(this._connection);

    /**
     * Client for the Menus API
     * @type MenusClient
     */
    this._menusClient = new MenusClient(this._connection);

    /**
     * Client for the Events API
     * @type EventsClient
     */
    this._eventsClient = new EventsClient(this._connection);

    /**
     * Client for the Restaurants API
     * @type RestaurantsClient
     */
    this._restaurantsClient = new RestaurantsClient(this._connection);
  }

  /**
   * @type OrdersClient
   */
  get order() {
    return this._ordersClient;
  }

  /**
   * @type EventsClient
   */
  get event() {
    return this._eventsClient;
  }

  /**
   * @type MenusClient
   */
  get menu() {
    return this._menusClient;
  }

  /**
   * @type RestaurantsClient
   */
  get restaurant() {
    return this._restaurantsClient;
  }

  /**
   * @type ApiConnection
   */
  get connection() {
    return this._connection;
  }
}
module.exports = ApiClient;
