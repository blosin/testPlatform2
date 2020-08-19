const Ensure = require('../helpers/Ensure');
const ProductsClient = require('../clients/ProductsClient');
const OptionsClient = require('../clients/OptionsClient');

/**
 * A client for Menus API.
 * @class MenusClient
 */
class MenusClient {
  /**
   * Instantiate a new Menu API Client
   * @param {ApiConnection} connection
   */
  constructor(connection) {
    Ensure.argumentNotNull(connection, 'connection');

    /**
     * An API connection
     * @type {ApiConnection}
     */
    this._connection = connection;

    /**
     * Client for the Products API
     */
    this._product = new ProductsClient(this._connection);

    /**
     * Client for the Options API
     */
    this._option = new OptionsClient(this._connection);
  }

  /**
   * Client for the Products API
   * @return {ProductsClient}
   */
  get product() {
    return this._product;
  }

  /**
   * Client for the Options API
   * @return {OptionsClient}
   */
  get option() {
    return this._option;
  }
}
module.exports = MenusClient;
