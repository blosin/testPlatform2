const expect = require('chai').expect;
const Region = require('../../../src/models/region');

describe('Validations Region schema.', function () {
    it('with correct minimum data', function (done) {
        const region = new Region({
            region: 'Argentina',
        });
        const err = region.validateSync();
        expect(err).to.be.undefined;
        done();
    });

    it('test cast errors', function (done) {
        const region = new Region({
            region: 'x'.repeat(101),
        });
        const err = region.validateSync();
        expect(err.errors['region'].name).to.equal('ValidatorError');
        done();
    });
});