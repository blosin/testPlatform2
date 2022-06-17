/**
 * @class PaginationOptions
 */
class PaginationOptions {
  constructor() {
    this._offset = 0;
    this._limit = 15;
  }

  static create() {
    return new this();
  }

  next() {
    this._offset += this._limit;
  }

  withOffset(offset) {
    this._offset = offset;
    return this;
  }

  withLimit(limit) {
    this._limit = limit;
    return this;
  }

  get offset() {
    return this._offset;
  }

  set offset(value) {
    this._offset = value;
  }

  get limit() {
    return this._limit;
  }

  set limit(value) {
    this._limit = value;
  }
}
module.exports = PaginationOptions;
