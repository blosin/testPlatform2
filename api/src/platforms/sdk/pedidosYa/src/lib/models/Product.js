class Product {
  constructor(
    id,
    name,
    description,
    integrationCode,
    integrationName,
    section,
    index,
    image,
    price,
    gtin,
    requiresAgeCheck,
    measurementUnit,
    contentQuantity,
    prescriptionBehaviour
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.integrationCode = integrationCode;
    this.integrationName = integrationName;
    this.section = section;
    this.index = index;
    this.image = image;
    this.price = price;
    this.gtin = gtin;
    this.requiresAgeCheck = requiresAgeCheck;
    this.measurementUnit = measurementUnit;
    this.contentQuantity = contentQuantity;
    this.prescriptionBehaviour = prescriptionBehaviour;
  }

  get id() {
    return this.id;
  }

  set id(id) {
    this.id = id;
  }

  get name() {
    return this.name;
  }

  set name(name) {
    this.name = name;
  }

  get description() {
    return this.description;
  }

  set description(description) {
    this.description = description;
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

  get section() {
    return this.section;
  }

  set section(section) {
    this.section = section;
  }

  get index() {
    return this.index;
  }

  set index(index) {
    this.index = index;
  }

  get image() {
    return this.image;
  }

  set image(image) {
    this.image = image;
  }

  get price() {
    return this.price;
  }

  set price(price) {
    this.price = price;
  }

  get gtin() {
    return this.gtin;
  }

  set gtin(gtin) {
    this.gtin = gtin;
  }

  get requiresAgeCheck() {
    return this.requiresAgeCheck;
  }

  set requiresAgeCheck(requiresAgeCheck) {
    this.requiresAgeCheck = requiresAgeCheck;
  }

  get measurementUnit() {
    return this.measurementUnit;
  }

  set measurementUnit(measurementUnit) {
    this.measurementUnit = measurementUnit;
  }

  get contentQuantity() {
    return this.contentQuantity;
  }

  set contentQuantity(contentQuantity) {
    this.contentQuantity = contentQuantity;
  }

  get prescriptionBehaviour() {
    return this.prescriptionBehaviour;
  }

  set prescriptionBehaviour(prescriptionBehaviour) {
    this.prescriptionBehaviour = prescriptionBehaviour;
  }
}

module.exports = Product;
