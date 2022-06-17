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
    super(connection, 'product');
  }

  async _getByName(menuItem, restaurant) {
    throw new Error('This operation is not allowed');
  }

  async _getItemPayload(menuItem, restaurantId) {
    return this._productPayload(menuItem, restaurantId);
  }

  async _getItemRoute() {
    return 'product';
  }

  async _getItemsRoute(product) {
    return 'product/sectionIntegrationCode/' + product.section.integrationCode;
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

  async _productPayload(product, restaurantId) {
    let newProduct = { section: {} };

    if (product !== null) {
      if (product.section !== null) {
        if (product.section.integrationCode !== null) {
          newProduct.section.integrationCode = product.section.integrationCode;
        }
        if (product.section.name !== null) {
          newProduct.section.name = product.section.name;
        }
      }
      if (product.integrationCode !== null) {
        newProduct.integrationCode = product.integrationCode;
      }
      if (product.gtin !== null) {
        newProduct.gtin = product.gtin;
      }
      if (product.integrationName !== null) {
        newProduct.integrationName = product.integrationName;
      }
      if (product.name !== null) {
        newProduct.name = product.name;
      }
      if (product.index !== null) {
        newProduct.index = product.index;
      }
      if (product.price !== null) {
        newProduct.price = product.price;
      }
      if (product.enabled !== null) {
        newProduct.enabled = product.enabled;
      }
      if (product.image !== null) {
        newProduct.image = product.image;
      }
      if (product.description !== null) {
        newProduct.description = product.description;
      }
      if (product.requiresAgeCheck !== null) {
        newProduct.requiresAgeCheck = product.requiresAgeCheck;
      }
      if (product.measurementUnit !== null) {
        newProduct.measurementUnit = product.measurementUnit;
      }
      if (product.contentQuantity !== null) {
        newProduct.contentQuantity = product.contentQuantity;
      }
      if (product.prescriptionBehaviour !== null) {
        newProduct.prescriptionBehaviour = product.prescriptionBehaviour;
      }
    }

    return newProduct;
  }
}
module.exports = ProductsClient;
