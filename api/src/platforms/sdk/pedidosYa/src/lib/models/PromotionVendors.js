class PromotionVendors {
  constructor(id, enable) {
    this.id = id;
    this.enable = enable;
  }

  get vendorsId() {
    return this.id;
  }

  set vendorsId(id) {
    this.id = id;
  }

  get vendorsId() {
    return this.enable;
  }

  set vendorsId(enable) {
    this.enable = enable;
  }
}

module.exports = PromotionVendors;
