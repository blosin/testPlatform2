const Ensure = require('./../helpers/Ensure')
const Enums = require('./../enums/OrderProductModificationType')
const ProductsReconciliation = require('reception-system-sdk/lib/models/ProductsReconciliation')

class Reconciliation {
  constructor(id, totalGross, products = []) {
    (this.id = id), (this.totalGross = totalGross), (this.products = products)
  }

  get orderId() {
    return this.id
  }

  set orderId(id) {
    this.id = id
  }

  get newTotal() {
    return this.totalGross
  }

  set newTotal(totalGross) {
    this.totalGross = totalGross
  }

  get productsList() {
    return this.products
  }

  set productsList(products) {
    this.products = products
  }

  async RemovalModificationProductBuilder(integrationCode) {
    Ensure.argumentNotNull(integrationCode, 'integrationCode')
    let product = new ProductsReconciliation()
    product.integrationCode = integrationCode
    product.modification = Enums.Removal
    this.products.push(product)
  }

  async ReplacementModificationProductBuilder(
    integrationCode,
    oldIntegrationCode,
    quantity,
    unitPrice
  ) {
    Ensure.argumentNotNull(integrationCode, 'integrationCode')
    Ensure.argumentNotNull(oldIntegrationCode, 'oldIntegrationCode')
    Ensure.greaterThanZero(quantity, 'quantity')
    Ensure.greaterThanZero(unitPrice, 'unitPrice')
    let product = new ProductsReconciliation()
    product.integrationCode = integrationCode;
    product.oldIntegrationCode = oldIntegrationCode
    product.quantity = quantity
    product.unitPrice = unitPrice
    product.modification = Enums.Replacement
    this.products.push(product)
  }

  async AdditionModificationProductBuilder(integrationCode, quantity, unitPrice) {
    Ensure.argumentNotNull(integrationCode, 'integrationCode')
    Ensure.greaterThanZero(quantity, 'quantity')
    Ensure.greaterThanZero(unitPrice, 'unitPrice')
    let product = new ProductsReconciliation()
    product.integrationCode = integrationCode
    product.quantity = quantity
    product.unitPrice = unitPrice
    product.modification = Enums.Addition
    this.products.push(product)
  }

  async ChangeModificationProductBuilder(integrationCode, quantity, unitPrice) {
    Ensure.argumentNotNull(integrationCode, 'integrationCode')
    Ensure.greaterThanZero(quantity, 'quantity')
    Ensure.greaterThanZero(unitPrice, 'unitPrice')
    let product = new ProductsReconciliation()
    product.integrationCode = integrationCode
    product.quantity = quantity
    product.unitPrice = unitPrice
    product.modification = Enums.Change
    this.products.push(product)
  }
}

module.exports = Reconciliation
