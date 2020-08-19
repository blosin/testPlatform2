class Section {
  constructor(name, index, integrationCode, integrationName) {
    this.name = name;
    this.index = index;
    this.integrationCode = integrationCode;
    this.integrationName = integrationName;
  }

  get name() {
    return this.name;
  }

  set name(name) {
    this.name = name;
  }

  get index() {
    return this.index;
  }

  set index(index) {
    this.index = index;
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
}

module.exports = Section;
