const ApiException = require('./../exceptions/ApiException');
const Request = require('./../http/Request');
const Ensure = require('../helpers/Ensure');
const RestaurantsClient = require('./RestaurantsClient');
const PaginationOptions = require('./../utils/PaginationOptions');

class MenuItemClient {
  /**
   * Instantiate a new Menu API Client
   * @param {ApiConnection} connection
   * @param {String} itemUrl
   */
  constructor(connection, itemUrl) {
    if (new.target === MenuItemClient) {
      throw new TypeError('Cannot construct MenuItemClient instances directly');
    }

    this._connection = connection;
    this._itemUrl = itemUrl;
  }

  async getRestaurants() {
    let restaurantClient = new RestaurantsClient(this._connection);
    return restaurantClient.getAll(PaginationOptions.create());
  }

  /**
   * Create the menuItem with the specified restaurant code/id
   * @param menuItem new menuItem to be created
   * @param restaurant restaurant code or restaurant id when using centralized keys
   * @return {bool} if the menuItem was created
   * @throws ApiException if some error has occurred
   */
  async create(menuItem, restaurant = null) {
    try {
      await this._connection.authenticate();
      if (this._connection.credentials.centralizedKeys() && restaurant === null) {
        return Error('You must specify a restaurantCode or restaurantId');
      }
      if (typeof restaurant === 'string') {
        Ensure.argumentNotNullOrEmptyString(restaurant, 'restaurant');
        let restaurants = await this.getRestaurants();
        let res = restaurants.find(res => res.integrationCode === restaurant);
        if (res) {
          return this._create(menuItem, null, res.id);
        }
        throw new Error('You must specify a valid restaurantCode ');
      }
      if (typeof restaurant === 'number') {
        Ensure.greaterThanZero(restaurant, 'restaurant');
        return this._create(menuItem, null, restaurant);
      }
      return this._create(menuItem, null, this._connection.restaurantId);
    } catch (exception) {
      throw new Error(exception.message);
    }
  }

  /**
   * Modify the menuItem with the specified restaurant code/id
   * @param menuItem menuItem to be modified
   * @param restaurant restaurant code or restaurant id when using centralized keys
   * @return {bool} if the menuItem was modified
   * @throws ApiException if some error has occurred
   */
  async modify(menuItem, restaurant = null) {
    await this._connection.authenticate();
    if (this._connection.credentials.centralizedKeys() && restaurant === null) {
      throw new Error('You must specify a restaurantCode or restaurantId');
    }
    if (typeof restaurant === 'string') {
      Ensure.argumentNotNullOrEmptyString(restaurant, 'restaurant');
      let restaurants = await this.getRestaurants();
      let res = restaurants.find(res => res.integrationCode === restaurant);
      if (res) {
        return this._modify(menuItem, null, res.id);
      }
      throw new Error('You must specify a valid restaurantCode ');
    }
    if (typeof restaurant === 'number') {
      Ensure.greaterThanZero(restaurant, 'restaurant');
      return this._modify(menuItem, null, restaurant);
    }
    return this._modify(menuItem, null, this._connection.restaurantId);
  }

  /**
   * Delete the menuItem with the specified restaurant code/id
   * @param menuItem menuItem to be deleted
   * @param restaurant restaurant code or restaurant id when using centralized keys
   * @return {bool} if the menuItem was deleted
   * @throws ApiException if some error has occurred
   */
  async delete(menuItem, restaurant = null) {
    await this._connection.authenticate();
    if (this._connection.credentials.centralizedKeys() && restaurant === null) {
      throw new Error('You must specify a restaurantCode or restaurantId');
    }
    if (typeof restaurant === 'string') {
      Ensure.argumentNotNullOrEmptyString(restaurant, 'restaurant');
      let restaurants = await this.getRestaurants();
      let res = restaurants.find(res => res.integrationCode === restaurant);
      if (res) {
        return this._delete(menuItem, null, res.id);
      }
      throw new Error('You must specify a valid restaurantCode ');
    }
    if (typeof restaurant === 'number') {
      Ensure.greaterThanZero(restaurant, 'restaurant');
      return this._delete(menuItem, null, restaurant);
    }
    return this._delete(menuItem, null, this._connection.restaurantId);
  }

  /**
   * Get all the menuItem with the specified restaurant code/id
   * @param restaurant restaurant code or restaurant id when using centralized keys
   * @return {menuItems} if the menuItems exists
   * @throws ApiException if some error has occurred
   */
  async getAll(menuItem, restaurant = null) {
    await this._connection.authenticate();
    if (this._connection.credentials.centralizedKeys() && restaurant === null) {
      throw new Error('You must specify a restaurantCode or restaurantId');
    }
    if (typeof restaurant === 'string') {
      Ensure.argumentNotNullOrEmptyString(restaurant, 'restaurant');
      let restaurants = await this.getRestaurants();
      let res = restaurants.find(res => res.integrationCode === restaurant);
      if (res) {
        return this._getAll(menuItem, res.id);
      }
      throw new Error('You must specify a valid restaurantCode ');
    }
    if (typeof restaurant === 'number') {
      Ensure.greaterThanZero(restaurant, 'restaurant');
      return this._getAll(menuItem, restaurant);
    }
    return this._getAll(menuItem, this._connection.restaurantId);
  }

  /**
   * Get the menuItem by id with the specified restaurant code/id
   * @param menuItem menuItem to get
   * @param restaurant restaurant code or restaurant id when using centralized keys
   * @return {menuItems} if the menuItems exists
   * @throws ApiException if some error has occurred
   */
  async getByName(menuItem, restaurant = null) {
    await this._connection.authenticate();
    if (this._connection.credentials.centralizedKeys() && restaurant === null) {
      throw new Error('You must specify a restaurantCode or restaurantId');
    }
    if (typeof restaurant === 'string') {
      Ensure.argumentNotNullOrEmptyString(restaurant, 'restaurant');
      let restaurants = await this.getRestaurants();
      let res = restaurants.find(res => res.integrationCode === restaurant);
      if (res) {
        return this._getByName(menuItem, res.id);
      }
      throw new Error('You must specify a valid restaurantCode ');
    }
    if (typeof restaurant === 'number') {
      Ensure.greaterThanZero(restaurant, 'restaurant');
      return this._getByName(menuItem, restaurant);
    }
    return this._getByName(menuItem, this._connection.restaurantId);
  }

  /**
   * Get the menuItem by integrationCode
   * @param menuItem menuItem to get
   * @param restaurant restaurant code or restaurant id when using centralized keys
   * @return {menuItems} if the menuItems exists
   * @throws ApiException if some error has occurred
   */
  async getByIntegrationCode(menuItem, restaurant = null) {
    await this._connection.authenticate();
    if (this._connection.credentials.centralizedKeys() && restaurant === null) {
      throw new Error('You must specify a restaurantCode or restaurantId');
    }
    if (typeof restaurant === 'string') {
      Ensure.argumentNotNullOrEmptyString(restaurant, 'restaurant');
      let restaurants = await this.getRestaurants();
      let res = restaurants.find(res => res.integrationCode === restaurant);
      if (res) {
        return this._getByIntegrationCode(menuItem, res.id);
      }
      throw new Error('You must specify a valid restaurantCode ');
    }
    if (typeof restaurant === 'number') {
      Ensure.greaterThanZero(restaurant, 'restaurant');
      return this._getByIntegrationCode(menuItem, restaurant);
    }
    return this._getByIntegrationCode(menuItem, this._connection.restaurantId);
  }

  /**
   * Get all the scheduleItem with the specified restaurant code/id
   * @param scheduleItem scheduleItem to get
   * @param restaurant restaurant code or restaurant id when using centralized keys
   * @return {scheduleItem} if the scheduleItem exists
   * @throws ApiException if some error has occurred
   */
  async getAllSchedules(scheduleItem, restaurant) {
    await this._connection.authenticate();
    if (this._connection.credentials.centralizedKeys() && restaurant === null) {
      throw new Error('You must specify a restaurantCode or restaurantId');
    }
    if (typeof restaurant === 'string') {
      Ensure.argumentNotNullOrEmptyString(restaurant, 'restaurant');
      let restaurants = await this.getRestaurants();
      let res = restaurants.find(res => res.integrationCode === restaurant);
      if (res) {
        return this._getAllSchedules(scheduleItem, res.id);
      }
      throw new Error('You must specify a valid restaurantCode ');
    }
    if (typeof restaurant === 'number') {
      Ensure.greaterThanZero(restaurant, 'restaurant');
      return this._getAllSchedules(scheduleItem, restaurant);
    }
    return this._getAllSchedules(scheduleItem, this._connection.restaurantId);
  }

  /**
   * Create the scheduleItem with the specified restaurant code/id
   * @param scheduleItem new scheduleItem to be created
   * @param restaurant restaurant code or restaurant id when using centralized keys
   * @return {scheduleItem} if the scheduleItem was created
   * @throws ApiException if some error has occurred
   */
  async createSchedule(scheduleItem, restaurant) {
    try {
      await this._connection.authenticate();
      if (this._connection.credentials.centralizedKeys() && restaurant === null) {
        return Error('You must specify a restaurantCode or restaurantId');
      }
      if (typeof restaurant === 'string') {
        Ensure.argumentNotNullOrEmptyString(restaurant, 'restaurant');
        let restaurants = await this.getRestaurants();
        let res = restaurants.find(res => res.integrationCode === restaurant);
        if (res) {
          return this._createSchedule(scheduleItem, restaurant);
        }
        throw new Error('You must specify a valid restaurantCode ');
      }
      if (typeof restaurant === 'number') {
        Ensure.greaterThanZero(restaurant, 'restaurant');
        return this._createSchedule(scheduleItem, restaurant);
      }
      return this._createSchedule(scheduleItem, this._connection.restaurantId);
    } catch (exception) {
      throw new Error(exception.message);
    }
  }

  /**
   * Delete the scheduleItem with the specified restaurant code/id
   * @param scheduleItem scheduleItem to be deleted
   * @param restaurant restaurant code or restaurant id when using centralized keys
   * @return {boolean} if the scheduleItem was deleted
   * @throws ApiException if some error has occurred
   */
  async deleteSchedule(scheduleItem, restaurant) {
    try {
      await this._connection.authenticate();
      if (this._connection.credentials.centralizedKeys() && restaurant === null) {
        return Error('You must specify a restaurantCode or restaurantId');
      }
      if (typeof restaurant === 'string') {
        Ensure.argumentNotNullOrEmptyString(restaurant, 'restaurant');
        let restaurants = await this.getRestaurants();
        let res = restaurants.find(res => res.integrationCode === restaurant);
        if (res) {
          return this._deleteSchedule(scheduleItem, restaurant);
        }
        throw new Error('You must specify a valid restaurantCode ');
      }
      if (typeof restaurant === 'number') {
        Ensure.greaterThanZero(restaurant, 'restaurant');
        return this._deleteSchedule(scheduleItem, restaurant);
      }
      return this._deleteSchedule(scheduleItem, this._connection.restaurantId);
    } catch (exception) {
      throw new Error(exception.message);
    }
  }

  async _getAll(menuItem, restaurantId) {
    try {
      let request = new Request();
      request.endpoint =
        this._connection._ismsUrl() + (await this._getItemsRoute(menuItem));
      request.headers = Object.assign(request.headers, {
        'Peya-Partner-Id': restaurantId
      });
      request.timeout = 1000000;
      let response = await this._connection.get(request);
      if (response.statusCode === 200) {
        return response.body.data;
      }
      throw ApiException.buildFromResponse(response);
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }
      throw new ApiException(error.message);
    }
  }

  async _getByName(menuItem, restaurantId) {
    try {
      let request = new Request();
      request.endpoint =
        this._connection._ismsUrl() +
        (await this._getItemsRoute(menuItem)) +
        '/name/' +
        menuItem.name;
      request.headers = Object.assign(request.headers, {
        'Peya-Partner-Id': restaurantId
      });
      request.timeout = 1000000;
      let response = await this._connection.get(request);
      if (response.statusCode === 200) {
        return response.body;
      }
      throw ApiException.buildFromResponse(response);
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }
      throw new ApiException(error.message);
    }
  }

  async _getByIntegrationCode(menuItem, restaurantId) {
    try {
      let request = new Request();
      request.endpoint =
        this._connection._ismsUrl() +
        (await this._getItemsRoute(menuItem)) +
        '/integrationCode/' +
        menuItem.integrationCode;
      request.headers = Object.assign(request.headers, {
        'Peya-Partner-Id': restaurantId
      });
      request.timeout = 1000000;
      let response = await this._connection.get(request);
      if (response.statusCode === 200) {
        return response.body;
      }
      throw ApiException.buildFromResponse(response);
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }
      throw new ApiException(error.message);
    }
  }

  async _create(menuItem, restaurantCode, restaurantId) {
    try {
      let request = new Request();
      request.endpoint =
        this._connection._ismsUrl() + (await this._getItemRoute(menuItem));
      request.headers = Object.assign(request.headers, {
        'Peya-Partner-Id': restaurantId
      });
      request.timeout = 1000000;
      let newMenuItem = await this._getItemPayload(menuItem, restaurantId);
      newMenuItem.enabled = true;
      request.body = newMenuItem;
      let response = await this._connection.post(request);
      if (response.statusCode === 200) {
        return response.body;
      }
      throw ApiException.buildFromResponse(response);
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }
      throw new ApiException(error.message);
    }
  }

  async _modify(menuItem, restaurantCode, restaurantId) {
    try {
      let request = new Request();
      request.endpoint =
        this._connection._ismsUrl() + (await this._getItemRoute(menuItem));
      request.headers = Object.assign(request.headers, {
        'Peya-Partner-Id': restaurantId
      });
      request.timeout = 1000000;
      request.body = await this._getItemPayload(menuItem, restaurantId);
      let response = await this._connection.put(request);
      if (response.statusCode === 200) {
        return response.body;
      }
      throw ApiException.buildFromResponse(response);
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }
      throw new ApiException(error.message);
    }
  }

  async _delete(menuItem, restaurantCode, restaurantId) {
    try {
      let request = new Request();
      request.endpoint =
        this._connection._ismsUrl() + (await this._getItemRoute(menuItem));
      request.headers = Object.assign(request.headers, {
        'Peya-Partner-Id': restaurantId
      });
      request.timeout = 1000000;
      request.body = await this._getItemPayload(menuItem, restaurantId);
      let response = await this._connection.delete(request);
      if (response.statusCode === 200) {
        return true;
      }
      throw ApiException.buildFromResponse(response);
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }
      throw new ApiException(error.message);
    }
  }

  async _getAllSchedules(scheduleItem, restaurantId) {
    try {
      let request = new Request();
      request.endpoint =
        this._connection._ismsUrl() + (await this._getSchedulesRoute(scheduleItem));
      request.headers = Object.assign(request.headers, {
        'Peya-Partner-Id': restaurantId
      });
      request.timeout = 1000000;
      let response = await this._connection.get(request);
      if (response.statusCode === 200) {
        return response.body.data;
      }
      throw ApiException.buildFromResponse(response);
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }
      throw new ApiException(error.message);
    }
  }

  async _createSchedule(scheduleItem, restaurantId) {
    try {
      let request = new Request();
      request.endpoint =
        this._connection._ismsUrl() +
        (await this._getItemRoute(scheduleItem)) +
        '/schedule';
      request.headers = Object.assign(request.headers, {
        'Peya-Partner-Id': restaurantId
      });
      request.timeout = 1000000;
      request.body = await this._getItemSchedulePayload(scheduleItem, restaurantId);
      let response = await this._connection.post(request);
      if (response.statusCode === 200) {
        return response.body;
      }
      throw ApiException.buildFromResponse(response);
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }
      throw new ApiException(error.message);
    }
  }

  async _deleteSchedule(scheduleItem, restaurantId) {
    try {
      let request = new Request();
      request.endpoint =
        this._connection._ismsUrl() +
        (await this._getItemRoute(scheduleItem)) +
        '/schedule';
      request.headers = Object.assign(request.headers, {
        'Peya-Partner-Id': restaurantId
      });
      request.timeout = 1000000;
      request.body = await this._getItemSchedulePayload(scheduleItem, restaurantId);
      let response = await this._connection.delete(request);
      if (response.statusCode === 200) {
        return true;
      }
      throw ApiException.buildFromResponse(response);
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }
      throw new ApiException(error.message);
    }
  }
  
  /**
  * Get all products gtins
  * @param pagination size and page for pagination
  * @param vendorId restaurant id
  * @return {list} list of 100 products
  * @throws ApiException if some error has occurred
  */
  async getAllGtins (pagination, vendorId) {
    Ensure.greaterThanZero(vendorId, 'vendorId')
    Ensure.argumentNotNullOrEmptyObject(pagination, 'pagination')
    let size = pagination._limit
    let page = pagination._offset
    if (size > 100) {
      size = 100
    }
    try {
      let request = new Request()
      request.endpoint = await this._connection._ismsUrl() + `product/allGtinDictionary?size=${size}&page=${page}`
      request.headers = Object.assign(request.headers, {
        'Peya-Partner-Id': vendorId,
        'Peya-Reception-System-Code': this._connection.credentials.clientId,
        'Peya-Sdk-Version': '1.8.2'
      })
      request.timeout = 1000000
      let response = await this._connection.get(request)
      return response.body.data
    } catch(exception) {
      throw new Error(exception.message)
    }
  }
  
  /**
  * Get gtins by a product name
  * @param name name to do the search
  * @param pagination size and page for pagination
  * @param vendorId restaurant id
  * @return {list} list of 100 products
  * @throws ApiException if some error has occurred
  */
  async getGtinsByName (name, pagination, vendorId) {
    Ensure.argumentNotNullOrEmptyString(name, 'name')
    Ensure.greaterThanZero(vendorId, 'vendorId')
    Ensure.argumentNotNullOrEmptyObject(pagination, 'pagination')
    let size = pagination._limit
    let page = pagination._offset
    if (size > 100) {
      size = 100
    }
    try {
      let request = new Request()
      request.endpoint = await this._connection._ismsUrl() + `product/name/${name}/gtinDictionary?size=${size}&page=${page}`
      request.headers = Object.assign(request.headers, {
        'Peya-Partner-Id': vendorId,
        'Peya-Reception-System-Code': this._connection.credentials.clientId,
        'Peya-Sdk-Version': '1.8.2'
      })
      request.timeout = 1000000
      let response = await this._connection.get(request)
      return response.body.data
    } catch(exception) {
      throw new Error(exception.message)
    }
  }

  async _getItemPayload(menuItem, restaurantId) {
    return '';
  }

  async _getItemRoute() {
    return '';
  }

  async _getItemsRoute() {
    return '';
  }

  async _getSchedulesRoute(scheduleItem, restaurantId) {
    return '';
  }

}
module.exports = MenuItemClient;
