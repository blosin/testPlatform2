class PromotionItems {
  constructor(id, type, before_price, enable) {
    this.id = id;
    this.type = type;
    this.before_price = before_price;
    this.enable = enable;
  }

  get itemsId() {
    return this.id;
  }

  set itemsId(id) {
    this.id = id;
  }

  get itemsType() {
    return this.type;
  }

  set itemsType(type) {
    this.type = type;
  }

  get itemsEnable() {
    return this.enable;
  }

  set itemsEnable(enable) {
    this.enable = enable;
  }

  get itemsBeforcePrice() {
    return this.before_price;
  }

  set itemsBeforcePrice(before_price) {
    this.before_price = before_price;
  }
}

module.exports = PromotionItems;
