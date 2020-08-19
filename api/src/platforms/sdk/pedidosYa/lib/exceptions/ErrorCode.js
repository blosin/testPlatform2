const ErrorCode = Object.freeze({
  /**
   * You should not see this code but be prepared
   */

  INTERNAL_SERVER_ERROR: 'INTERNAL_ERROR_CODE',

  /**
   * When trying to update an order that has been cancelled already
   */

  ORDER_CANCELLED: 'ORDER_CANCELLED',

  /**
   * When trying to update an order that has been confirmed already
   */

  ORDER_CONFIRMED: 'ORDER_CONFIRMED',

  /**
   * When trying to update an order that has been rejected already
   */
  ORDER_REJECTED: 'ORDER_REJECTED',

  /**
   * When the token is invalid or you don't have permission
   */
  INVALID_TOKEN: 'INVALID_TOKEN',

  /**
   * When the resource not exists
   */
  NOT_EXISTS: 'NOT_EXISTS',

  /**
   * When the item already exists
   */
  MENU_ITEM_ALREADY_EXISTS: 'MENU_ITEM_ALREADY_EXISTS',

  /**
   * When some parameter is missing in the request
   */
  MISSING_PARAM: 'MISSING_PARAM',

  /**
   * When trying to create a new product with a new vertical partner
   */
  NOT_ALLOWED: 'NOT_ALLOWED'
});
module.exports = ErrorCode;
