const expect = require('chai').expect;
const Branch = require('../../../src/models/branch');

describe('Validations Branch schema.', function () {
  it('with correct minimum data', function (done) {
    const branch = new Branch({
      branchId: 14,
      branchSecret: '14asd',
      name: 'Branch X',
      branchTimeout: 20,
      startDate: new Date(),
      platforms: [
        {
          platform: '3b0ed8fa297fb07209439589',
          branchReference: 2,
          branchIdReference: 2,
          lastGetNews: new Date(),
          progClosed: [
            { close: new Date(), open: new Date(), description: 'descripcion' }
          ]
        }
      ],
      tzo: -3
    });
    const err = branch.validateSync();
    expect(err).to.be.undefined;
    done();
  });

  it('test attributes larger than allowed', function (done) {
    const branch = new Branch({
      branchId: 14,
      branchSecret: 'x'.repeat(51),
      name: 'x'.repeat(101),
      branchTimeout: 20,
      startDate: new Date(),
      smartfran_sw: {
        agent: {
          installedVersion: 'x'.repeat(51)
        },
        notificator: {
          installedVersion: 'x'.repeat(51)
        }
      },
      tzo: -3
    });
    const err = branch.validateSync();
    expect(err.errors['branchSecret'].name).to.equal('ValidatorError');
    expect(err.errors['name'].name).to.equal('ValidatorError');
    expect(err.errors['smartfran_sw.agent.installedVersion'].name).to.equal(
      'ValidatorError'
    );
    expect(
      err.errors['smartfran_sw.notificator.installedVersion'].name
    ).to.equal('ValidatorError');
    done();
  });
  it('test cast errors', function (done) {
    const branch = new Branch({
      branchId: 'not number',
      branchSecret: '14asd',
      name: 'Branch X',
      branchTimeout: 'not number',
      startDate: 'not date',
      platforms: [
        {
          platform: 14,
          branchReference: 14,
          branchIdReference: '123',
          lastGetNews: 'not date',
          progClosed: [{ close: 'not date', open: 'not date' }]
        }
      ],
      tzo: 'not number'
    });

    const err = branch.validateSync();
    expect(err.errors['branchId'].name).to.equal('CastError');
    expect(err.errors['branchTimeout'].name).to.equal('CastError');
    expect(err.errors['startDate'].name).to.equal('CastError');
    expect(err.errors['platforms.0.lastGetNews'].name).to.equal('CastError');
    expect(err.errors['platforms.0.progClosed.0.close'].name).to.equal(
      'CastError'
    );
    expect(err.errors['platforms.0.progClosed.0.open'].name).to.equal(
      'CastError'
    );
    expect(err.errors['tzo'].name).to.equal('CastError');
    done();
  });
});
