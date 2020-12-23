const expect = require('chai').expect;
const Chain = require('../../../src/models/chain');

describe('Validations Chain schema.', function () {
    it('with correct minimum data', function (done) {
        const chain = new Chain({
            chain: 'Grido',
            domain: 'www.grido.com',
            contact: 'Juan Perez',
            phone: '123456789',
            address: 'Esquina sin número',
            avatar: 'asfijaspfijas',
        });
        const err = chain.validateSync();
        expect(err).to.be.undefined;
        done();
    });

    it('test attributes larger than allowed', function (done) {
        const chain = new Chain({
            chain: 'x'.repeat(101),
            domain: 'x'.repeat(101),
            contact: 'x'.repeat(101),
            phone: 'x'.repeat(16),
        });
        const err = chain.validateSync();
        expect(err.errors['chain'].name).to.equal('ValidatorError');
        expect(err.errors['domain'].name).to.equal('ValidatorError');
        expect(err.errors['contact'].name).to.equal('ValidatorError');
        expect(err.errors['phone'].name).to.equal('ValidatorError');
        done();
    });
});