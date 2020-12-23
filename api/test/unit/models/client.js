const expect = require('chai').expect;
const Country = require('../../../src/models/country');

describe('Validations Country schema.', function () {
    it('with correct minimum data', function (done) {
        const country = new Country({
            country: 'Grido'
        });
        const err = country.validateSync();
        expect(err).to.be.undefined;
        done();
    });

    it('test attributes larger than allowed', function (done) {
        const country = new Country({
            country: 'x'.repeat(101)
        });
        const err = country.validateSync();
        expect(err.errors['country'].name).to.equal('ValidatorError');
        done();
    });
});