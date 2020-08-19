let moment = require('moment');

/**
 * Utility class to handle dates
 */
class DateUtil {
  /**
   * Returns a date in a string format(yyyy-MM-dd'T'HH:mm:ss'Z')
   * @param date the date to be formatted
   */
  static formatDate(date) {
    return moment(date).format('YYYY-MM-DDTHH:mm:ss\\Z');
  }
}
module.exports = DateUtil;
