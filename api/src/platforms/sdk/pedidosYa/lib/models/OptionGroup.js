class OptionGroup {
  constructor(
    name,
    integrationCode,
    integrationName,
    product,
    maximumQuantity,
    minimumQuantity
  ) {
    this.name = name;
    this.integrationCode = integrationCode;
    this.integrationName = integrationName;
    this.product = product;
    this.maximumQuantity = maximumQuantity;
    this.minumumQuantity = minimumQuantity;
  }

  get name() {
    return this.name;
  }

  set name(name) {
    this.name = name;
  }

  get integrationCode() {
    return this.integrationCode;
  }

  set integrationCode(integrationCode) {
    this.integrationCode = integrationCode;
  }

  get integrationName() {
    return this.integrationName;
  }

  set integrationName(integrationName) {
    this.integrationName = integrationName;
  }

  get product() {
    return this.product;
  }

  set product(product) {
    this.product = product;
  }

  get maximumQuantity() {
    return this.maximumQuantity;
  }

  set maximumQuantity(maximumQuantity) {
    this.maximumQuantity = maximumQuantity;
  }

  get minumumQuantity() {
    return this.minumumQuantity;
  }

  set minumumQuantity(minumumQuantity) {
    this.minumumQuantity = minumumQuantity;
  }
}

module.exports = OptionGroup;
