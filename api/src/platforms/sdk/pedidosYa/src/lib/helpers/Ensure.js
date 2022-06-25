let moment = require('moment');

/**
 * Utility class to check parameters
 */
class Ensure {
  /**
   * Checks an argument to ensure it's not null.
   * @param value
   * @param {String} name
   */
  static argumentNotNull(value, name) {
    if (value === null) {
      throw new Error('Argument ' + name + ' can not be null');
    }
  }

  static argumentNotNullOrEmptyString(value, name) {
    Ensure.argumentNotNull(value, name);

    if (value === undefined || value === null || value.length === 0) {
      throw new Error('Argument ' + name + ' can not be empty');
    }
  }

  static argumentNotNullOrEmptyObject(value, name) {
    Ensure.argumentNotNull(value, name);

    if (
      value === undefined ||
      (Object.keys(value).length === 0 && value.constructor === Object)
    ) {
      throw new Error('Argument ' + name + ' can not be empty');
    }
  }

  static greaterThanZero(value, name) {
    if (typeof value !== 'number') {
      throw new Error(name + ' must be greater than zero');
    }

    if (value <= 0) {
      throw new Error(name + ' must be greater than zero');
    }
  }

  static greaterOrEqualsThanZero(value, name) {
    if (typeof value !== 'number') {
      throw new Error(name + ' must be greater or equals than zero');
    }

    if (value < 0) {
      throw new Error(name + ' must be greater or equals than zero');
    }
  }

  static validDateFormat(value, name, format = 'YYYY-MM-DDTHH:mm:ss') {
    try {
      let valid = moment(value, format, true).isValid();
      if (!valid) {
        throw new Error(
          name + ' has an invalid format. The correct one is "YYYY-MM-DDTHH:mm:ss'
        );
      }
      return valid;
    } catch (error) {
      throw new Error(
        name + ' has an invalid format. The correct one is "YYYY-MM-DDTHH:mm:ss'
      );
    }
  }

  static firstDateBeforeSecond(first, second, firstName, secondName) {
    let firstDate = moment(first);
    let secondDate = moment(second);
    if (secondDate.diff(firstDate) <= 0) {
      throw new Error(firstName + ' must be before than ' + secondName);
    }
  }
}
module.exports = Ensure;
