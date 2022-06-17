const MenuItemClient = require('../clients/MenuItemClient');
const Ensure = require('../helpers/Ensure');

/**
 * @class OptionGroupClient
 */
class OptionGroupClient extends MenuItemClient {
  /**
   * Instantiate a new OptionGroup API Client
   * @param connection
   */
  constructor(connection) {
    Ensure.argumentNotNull(connection, 'connection');
    super(connection, 'optionGroup');
  }

  async _getAllSchedules(scheduleItem, restaurantId) {
    throw new Error('This operation is not allowed');
  }

  async _createSchedule(scheduleItem, restaurantId) {
    throw new Error('This operation is not allowed');
  }

  async _deleteSchedule(scheduleItem, restaurantId) {
    throw new Error('This operation is not allowed');
  }

  async _getItemPayload(menuItem, restaurantId) {
    return this._optionGroupPayload(menuItem, restaurantId);
  }

  async _getItemRoute() {
    return 'optionGroup';
  }

  async _getItemsRoute(optionGroup) {
    return 'optionGroup/productIntegrationCode/' + optionGroup.product.integrationCode;
  }

  async _optionGroupPayload(optionGroup, restaurantId) {
    let newOptionGroup = { optionGroup: {} };
    newOptionGroup.product = { product: {} };
    if (restaurantId !== null) {
      newOptionGroup.product.partnerId = restaurantId;
    }
    if (optionGroup !== null) {
      if (optionGroup.product !== null) {
        if (optionGroup.product.integrationCode !== null) {
          newOptionGroup.product.integrationCode = optionGroup.product.integrationCode;
        }
      }
      if (optionGroup.name !== null) {
        newOptionGroup.name = optionGroup.name;
      }
      if (optionGroup.integrationCode !== null) {
        newOptionGroup.integrationCode = optionGroup.integrationCode;
      }
      if (optionGroup.integrationName !== null) {
        newOptionGroup.integrationName = optionGroup.integrationName;
      }
      if (optionGroup.maximumQuantity !== null) {
        newOptionGroup.maximumQuantity = optionGroup.maximumQuantity;
      }
      if (optionGroup.minimumQuantity !== null) {
        newOptionGroup.minimumQuantity = optionGroup.minimumQuantity;
      }
      if (optionGroup.index !== null) {
        newOptionGroup.index = optionGroup.index;
      }
    }
    return newOptionGroup;
  }
}
module.exports = OptionGroupClient;
