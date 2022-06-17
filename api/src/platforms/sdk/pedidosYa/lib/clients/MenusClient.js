const Ensure = require('../helpers/Ensure');
const OptionsClient = require('../clients/OptionsClient');
const OptionGroupClient = require('../clients/OptionGroupClient');
const SectionClient = require('../clients/SectionClient');
const ProductClient = require('../clients/ProductsClient');
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
     * Client for the Options API
     */
    this._option = new OptionsClient(this._connection);

    /**
     * Client for the OptionGroup API
     */
    this._optionGroup = new OptionGroupClient(this._connection);

    /**
     * Client for the Section API
     */
    this._section = new SectionClient(this._connection);

    /**
     * Client for the Product API
     * @type ProductsClient
     */
    this._products = new ProductClient(this._connection);
  }

  /**
   * Client for the Options API
   * @return {OptionsClient}
   */
  get option() {
    return this._option;
  }

  /**
   * Client for the OptionGroup API
   * @return {OptionGroupClient}
   */
  get optionGroup() {
    return this._optionGroup;
  }

  /**
   * Client for the Section API
   * @return {SectionClient}
   */
  get section() {
    return this._section;
  }

  /**
   * @type ProductsClient
   */
  get products() {
    return this._products;
  }
}
module.exports = MenusClient;
