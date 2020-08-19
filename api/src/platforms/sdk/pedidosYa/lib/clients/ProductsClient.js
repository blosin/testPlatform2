const MenuItemClient = require('../clients/MenuItemClient');
const Ensure = require('../helpers/Ensure');

/**
 * @class ProductsClient
 */
class ProductsClient extends MenuItemClient {
  /**
   * Instantiate a new Product API Client
   * @param connection
   */
  constructor(connection) {
    Ensure.argumentNotNull(connection, 'connection');
    super(connection, 'products');
  }

  /**
   * Enable the product with the specified code
   * @param integrationCode code of the product to be enabled
   * @param restaurant restaurant id or restaurant code when using centralized keys
   * @return {bool} if the product was enabled
   * @throws ApiException if some error has occurred
   */
  async enable(integrationCode, restaurant = null) {
    return super.enable(integrationCode, restaurant);
  }

  /**
   * Disable the product with the specified code
   * @param integrationCode code of the product to be disabled
   * @param restaurant restaurant id or restaurant code when using centralized keys
   * @return {bool} if the product was disabled
   * @throws ApiException if some error has occurred
   */
  async disable(integrationCode, restaurant = null) {
    return super.disable(integrationCode, restaurant);
  }

  /**
   * Update the price of the product with the specified code
   * @param integrationCode code of the product to be updated
   * @param price new price of the product
   * @param restaurant restaurant id or restaurant code when using centralized keys
   * @return {bool} if the product was disabled
   * @throws ApiException if some error has occurred
   */
  async price(integrationCode, price, restaurant = null) {
    return super.price(integrationCode, price, restaurant);
  }

  /**
   * Create the product with the specified restaurant code/id
   * @param product new product to be created
   * @param restaurant restaurant code or restaurant id when using centralized keys
   * @return {bool} if the product was created
   * @throws ApiException if some error has occurred
   */
  async create(product, restaurant = null) {
    return super.create(product, restaurant);
  }

  /**
   * Modify the product with the specified restaurant code/id
   * @param product new product to be modified
   * @param restaurant restaurant code or restaurant id when using centralized keys
   * @return {bool} if the product was created
   * @throws ApiException if some error has occurred
   */
  async modify(product, restaurant = null) {
    return super.modify(product, restaurant);
  }
}
module.exports = ProductsClient;
