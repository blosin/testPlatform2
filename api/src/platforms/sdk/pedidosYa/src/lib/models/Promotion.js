const Ensure = require('./../helpers/Ensure');
const ItemsBeforePrice = require('./ItemsBeforePrice');
const PromotionItems = require('./PromotionItems');
const PromotionVendors = require('./PromotionVendors');

class Promotion {
  constructor(id, name, enable, items = [], vendors = [], exposition_dates) {
    this.id = id;
    this.name = name;
    this.enable = enable;
    this.items = items;
    this.vendors = vendors;
    this.exposition_dates = exposition_dates;
  }

  get promotionId() {
    return this.id;
  }

  set promotionId(id) {
    this.id = id;
  }

  get promotionName() {
    return this.name;
  }

  set promotionName(name) {
    this.name = name;
  }

  get promotionEnable() {
    return this.enable;
  }

  set promotionEnable(enable) {
    this.enable = enable;
  }

  get promotionItems() {
    return this.items;
  }

  set promotionItems(items) {
    this.items = items;
  }

  get promotionVendors() {
    return this.vendors;
  }

  set promotionVendors(vendors) {
    this.vendors = vendors;
  }

  get promotionExpositionDates() {
    return this.exposition_dates;
  }

  set promotionExpositionDates(exposition_dates) {
    this.exposition_dates = exposition_dates;
  }

  async addItem(itemId, type, amount, enable) {
    const before_price = new ItemsBeforePrice();
    before_price.amount = amount;

    const item = new PromotionItems();
    item.id = itemId;
    item.type = type;
    item.enable = enable;
    item.before_price = before_price;

    this.items.push(item);
  }

  async addVendor(id, enable) {
    const vendor = new PromotionVendors();
    vendor.id = id;
    vendor.enable = enable;

    this.vendors.push(vendor);
  }
}

module.exports = Promotion;
