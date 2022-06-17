const Ensure = require('../helpers/Ensure');
const MenuItemClient = require('../clients/MenuItemClient');

/**
 * @class SectionClient
 */
class SectionClient extends MenuItemClient {
  /**
   * Instantiate a new Section API Client
   * @param connection
   */
  constructor(connection) {
    Ensure.argumentNotNull(connection, 'connection');
    super(connection, 'section');
  }

  async _getItemPayload(menuItem, restaurantId) {
    return this._sectionPayload(menuItem, restaurantId);
  }

  async _getItemRoute() {
    return 'section';
  }

  async _getItemsRoute() {
    return 'section';
  }

  async _getSchedulesRoute(scheduleItem) {
    return 'section/name/' + scheduleItem.section.name + '/schedule';
  }

  async getAll(restaurant = null) {
    return super.getAll(null, restaurant);
  }

  async _sectionPayload(section, restaurantId) {
    let newSection = {};

    if (restaurantId !== null) {
      newSection.partnerId = restaurantId;
    }
    if (section !== null) {
      if (section.name !== null) {
        newSection.name = section.name;
      }
      if (section.integrationCode !== null) {
        newSection.integrationCode = section.integrationCode;
      }
      if (section.index !== null) {
        newSection.index = section.index;
      }
      if (section.enabled !== null) {
        newSection.enabled = section.enabled;
      }
      if (section.integrationName !== null) {
        newSection.integrationName = section.integrationName;
      }
    }
    return newSection;
  }

  async _getItemSchedulePayload(scheduleItem, restaurantId) {
    let newSchedule = { section: {} };

    if (restaurantId !== null) {
      newSchedule.partnerId = restaurantId;
    }
    if (scheduleItem !== null) {
      if (scheduleItem.section !== null) {
        if (scheduleItem.section.integrationCode !== null) {
          newSchedule.section.integrationCode = scheduleItem.section.integrationCode;
        }
        if (scheduleItem.section.name !== null) {
          newSchedule.section.name = scheduleItem.section.name;
        }
      }
      if (scheduleItem.from !== null) {
        newSchedule.from = scheduleItem.from;
      }
      if (scheduleItem.to !== null) {
        newSchedule.to = scheduleItem.to;
      }
      if (scheduleItem.day !== null) {
        newSchedule.day = scheduleItem.day;
      }
    }
    return newSchedule;
  }
}
module.exports = SectionClient;
