class Section {
  constructor(name, index, integrationCode, integrationName, enabled) {
    this.name = name;
    this.index = index;
    this.integrationCode = integrationCode;
    this.integrationName = integrationName;
    this.enabled = enabled;
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

  get enabled() {
    return this.enabled;
  }

  set enabled(enabled) {
    this.enabled = enabled;
  }
}

module.exports = Section;
