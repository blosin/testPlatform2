const expect = require('chai').expect;
const Platform = require('../../../src/models/platform');

describe('Validations Platform schema.', function () {
    it('with correct minimum data', function (done) {
        const platform = new Platform({
            name: 'Plataform X',
            internalCode: 100
        });
        const err = platform.validateSync();
        expect(err).to.be.undefined;
        done();
    });

    it('test attributes larger than allowed', function (done) {
        const platform = new Platform({
            name: 'x'.repeat(101),
            credentials: {
            },
        });
        const err = platform.validateSync();
        expect(err.errors['name'].name).to.equal('ValidatorError');
        done();
    });

    it('test cast errors', function (done) {
        const platform = new Platform({
            name: 'Plataform X',
            internalCode: 'not number',
            lastContact: 'not date',
        });
        const err = platform.validateSync();
        expect(err.errors['internalCode'].name).to.equal('CastError');
        expect(err.errors['lastContact'].name).to.equal('CastError');
        done();
    });
});