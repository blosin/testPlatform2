class ItemsBeforePrice {
  constructor(amount) {
    this.amount = amount;
  }

  get price() {
    return this.amount;
  }

  set price(amount) {
    this.amount = amount;
  }
}

module.exports = ItemsBeforePrice;
