class PromotionExpositionDates {
  constructor(from, to) {
    this.from = from;
    this.to = to;
  }

  get expositionDatesFrom() {
    return this.from;
  }

  set expositionDatesFrom(from) {
    this.from = from;
  }

  get expositionDatesTo() {
    return this.to;
  }

  set expositionDatesTo(to) {
    this.to = to;
  }
}

module.exports = PromotionExpositionDates;
