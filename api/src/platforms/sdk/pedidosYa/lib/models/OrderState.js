const OrderState = Object.freeze({
  /**
   * State of the order when is new and ready to be answered
   */
  PENDING: 'PENDING',

  /**
   * State of the order when is confirmed
   */
  CONFIRMED: 'CONFIRMED',

  /**
   * State of the order when is rejected
   */
  REJECTED: 'REJECTED'
});
module.exports = OrderState;
