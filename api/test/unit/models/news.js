const expect = require('chai').expect;
const News = require('../../../src/models/news');

describe('Validations News schema.', function () {
    it('with correct minimum data', function (done) {
        const news = new News({
            typeId: 1,
            order: {},
            branchId: 14
        });
        const err = news.validateSync();
        expect(err).to.be.undefined;
        done();
    });

    it('test cast errors', function (done) {
        const news = new News({
            typeId: 'not number',
            branchId: 'not number',
            timestamp: 'not date',
            viewed: 'not date',
            traces: [{
                createdAt: 'not date',
            }]
        });
        const err = news.validateSync();
        expect(err.errors['typeId'].name).to.equal('CastError');
        expect(err.errors['branchId'].name).to.equal('CastError');
        expect(err.errors['viewed'].name).to.equal('CastError');
        expect(err.errors['traces.0.createdAt'].name).to.equal('CastError');
        done();
    });
});