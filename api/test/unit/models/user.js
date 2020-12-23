const expect = require('chai').expect;
const User = require('../../../src/models/user');

describe('Validations User schema.', function () {
    it('with correct minimum data', function (done) {
        const user = new User({
            firstname: 'Homero',
            lastname: 'Simpson',
            email: 'homero.simson@ross.com.ar',
        });
        const err = user.validateSync();
        expect(err).to.be.undefined;
        done();
    });

    it('test attributes larger than allowed', function (done) {
        const user = new User({
            firstname: 'x'.repeat(101),
            lastname: 'x'.repeat(101),
            email: 'x'.repeat(101),
            address: 'x'.repeat(101),
            user: 'x'.repeat(51),
            password: 'x'.repeat(51)
        });
        const err = user.validateSync();
        expect(err.errors['firstname'].name).to.equal('ValidatorError');
        expect(err.errors['lastname'].name).to.equal('ValidatorError');
        expect(err.errors['email'].name).to.equal('ValidatorError');
        expect(err.errors['address'].name).to.equal('ValidatorError');
        expect(err.errors['user'].name).to.equal('ValidatorError');
        expect(err.errors['password'].name).to.equal('ValidatorError');
        done();
    });

    it('test cast errors', function (done) {
        const user = new User({
            firstname: 1,
            lastname: 2,
            email: 3,
            dni: 'not number',
        });
        const err = user.validateSync();
        expect(err.errors['dni'].name).to.equal('CastError');
        done();
    });
});