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

  async _getByName(menuItem, restaurant) {
    throw new Error('This operation is not allowed');
  }

  async _getByIntegrationCode(menuItem, restaurant) {
    throw new Error('This operation is not allowed');
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
    return this._optionPayload(menuItem, restaurantId);
  }

  async _getItemRoute() {
    return 'option';
  }

  async _getItemsRoute(option) {
    return (
      'option/product/' +
      option.optionGroup.product.integrationCode +
      '/optionGroup/' +
      option.optionGroup.integrationCode
    );
  }

  async _optionPayload(option, restaurantId) {
    let newOption = {};
    newOption.optionGroup = {};
    newOption.optionGroup.product = {};
    if (restaurantId !== null) {
      newOption.optionGroup.product.partnerId = restaurantId;
    }
    if (option !== null) {
      if (option.optionGroup !== null) {
        if (option.optionGroup.product !== null) {
          if (option.optionGroup.product.integrationCode !== null) {
            newOption.optionGroup.product.integrationCode =
              option.optionGroup.product.integrationCode;
          }
        }
        if (option.optionGroup.integrationCode !== null) {
          newOption.optionGroup.integrationCode = option.optionGroup.integrationCode;
        }
        if (option.optionGroup.integrationName !== null) {
          newOption.optionGroup.integrationName = option.optionGroup.integrationName;
        }
        if (option.optionGroup.name !== null) {
          newOption.optionGroup.name = option.optionGroup.name;
        }
      }
      if (option.name !== null) {
        newOption.name = option.name;
      }
      if (option.integrationCode !== null) {
        newOption.integrationCode = option.integrationCode;
      }
      if (option.integrationName !== null) {
        newOption.integrationName = option.integrationName;
      }
      if (option.price !== null) {
        newOption.price = option.price;
      }
      if (option.enabled !== null) {
        newOption.enabled = option.enabled;
      }
      if (option.quantity !== null) {
        newOption.quantity = option.quantity;
      }
      if (option.index !== null) {
        newOption.index = option.index;
      }
      if (option.modifiesPrice !== null) {
        newOption.modifiesPrice = option.modifiesPrice;
      }
      if (option.requiresAgeCheck !== null) {
        newOption.requiresAgeCheck = option.requiresAgeCheck;
      }
    }
    return newOption;
  }
}
module.exports = OptionsClient;
