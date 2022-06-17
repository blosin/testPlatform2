class ProductsReconciliation {
  constructor(integrationCode, oldIntegrationCode, quantity, unitPrice, modification) {
    (this.integrationCode = integrationCode),
      (this.oldIntegrationCode = oldIntegrationCode),
      (this.quantity = quantity),
      (this.unitPrice = unitPrice),
      (this.modification = modification)
  }

  get gtin() {
    return this.integrationCode
  }

  set gtin(integrationCode) {
    this.integrationCode = integrationCode
  }

  get oldGtin() {
    return this.oldIntegrationCode
  }

  set oldGtin(oldIntegrationCode) {
    this.oldIntegrationCode = oldIntegrationCode
  }

  get gtinQuantity() {
    return this.quantity
  }

  set gtinQuantity(quantity) {
    this.quantity = quantity
  }

  get gtinUnitPrice() {
    return this.unitPrice
  }

  set gtinUnitPrice(unitPrice) {
    this.unitPrice = unitPrice
  }

  get gtinModification() {
    return this.modification
  }

  set gtinModification(modification) {
    this.modification = modification
  }
}

module.exports = ProductsReconciliation
