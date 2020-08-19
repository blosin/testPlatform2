const MenuItemClient = require('../clients/MenuItemClient');
const Ensure = require('../helpers/Ensure');

/**
 * @class OptionsClient
 */
class OptionsClient extends MenuItemClient {
  /**
   * Instantiate a new Options API Client
   * @param connection
   */
  constructor(connection) {
    Ensure.argumentNotNull(connection, 'connection');
    super(connection, 'options');
  }

  /**
   * Enable the option with the specified code
   * @param integrationCode code of the option to be enabled
   * @param restaurant restaurant id or restaurant code when using centralized keys
   * @return {bool} if the option was enabled
   * @throws ApiException if some error has occurred
   */
  async enable(integrationCode, restaurant = null) {
    return super.enable(integrationCode, restaurant);
  }

  /**
   * Disable the option with the specified code
   * @param integrationCode code of the option to be disabled
   * @param restaurant restaurant id or restaurant code when using centralized keys
   * @return {bool} if the option was disabled
   * @throws ApiException if some error has occurred
   */
  async disable(integrationCode, restaurant = null) {
    return super.disable(integrationCode, restaurant);
  }

  /**
   * Update the price of the option with the specified code
   * @param integrationCode code of the option to be updated
   * @param price new price of the option
   * @param restaurant restaurant id or restaurant code when using centralized keys
   * @return {bool} if the option was disabled
   * @throws ApiException if some error has occurred
   */
  async price(integrationCode, price, restaurant = null) {
    return super.price(integrationCode, price, restaurant);
  }
}
module.exports = OptionsClient;
