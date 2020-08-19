const expect = require('chai').expect;
const Order = require('../../../src/models/order');

describe('Validations Order schema.', function () {
    it('with correct minimum data', function (done) {
        const order = new Order({
            thirdParty: 'Plataform X',
            internalCode: 100,
            state: 'PENDDING',
            orderId: '191*8sadasda',
            branchId: 155,
        });
        const err = order.validateSync();
        expect(err).to.be.undefined;
        done();
    });

    it('test attributes larger than allowed', function (done) {
        const order = new Order({
            thirdParty: 'x'.repeat(101),
            internalCode: 100,
            state: 'x'.repeat(101),
            orderId: 'x'.repeat(101),
            branchId: 14,
        });
        const err = order.validateSync();
        expect(err.errors['thirdParty'].name).to.equal('ValidatorError');
        expect(err.errors['state'].name).to.equal('ValidatorError');
        expect(err.errors['orderId'].name).to.equal('ValidatorError');
        done();
    });

    it('test cast errors', function (done) {
        const order = new Order({
            thirdParty: 'Plataform X',
            internalCode: 'not number',
            timestamp: 'not date',
            state: 'PENDDING',
            orderId: '123123aswq',
            branchId: 'not number',
        });
        const err = order.validateSync();
        expect(err.errors['internalCode'].name).to.equal('CastError');
        expect(err.errors['branchId'].name).to.equal('CastError');
        expect(err.errors['timestamp'].name).to.equal('CastError');
        done();
    });
});
