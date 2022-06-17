const TrackingState = Object.freeze({

  /**
   * State of the tracking when it failed
   */
  FAILURE: "FAILURE",

/**
 * State of the tracking when a driver is being requested
 */
  REQUESTING_DRIVER: "REQUESTING_DRIVER",

/**
 * State of the tracking when the order is being transmitted
 */
  TRANSMITTING: "TRANSMITTING",

/**
 * State of the tracking when the order is finally transmitted
 */
  TRANSMITTED: "TRANSMITTED",

/**
 * State of the tracking when the order is being prepared
 */
  PREPARING: "PREPARING",

/**
 * State of the tracking when the order is being delivered
 */
  DELIVERING: "DELIVERING",

/**
 * State of the tracking when the order is finally delivered
 */
  DELIVERED: "DELIVERED",

/**
 * State of the tracking when the order is closed and no live tracking happens
 */
  CLOSED: "CLOSED"

});
module.exports = TrackingState;
