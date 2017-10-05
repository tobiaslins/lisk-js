/*
 * Copyright © 2017 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 *
 */
import registerSecondSignature from '../../src/transactions/1_registerSecondSignature';
import cryptoModule from '../../src/crypto';
import slots from '../../src/time/slots';

afterEach(() => sandbox.restore());

describe('#registerSecondSignature', () => {
	const secret = 'secret';
	const secondSecret = 'second secret';
	const publicKey = '5d036a858ce89f844491762eb89e2bfbd50a4a0a0da658e4b2628b25b117ae09';
	const secondPublicKey = '0401c8ac9f29ded9e1e4d5b6b43051cb25b22f27c7b7b35092161e851946f82f';
	const emptyStringPublicKey = 'be907b4bac84fee5ce8811db2defc9bf0b2a2a2bbc3d54d8a2257ecd70441962';
	const signatureFee = 5e8;
	const timeWithOffset = 38350076;

	let getTimeWithOffsetStub;
	let registerSecondSignatureTransaction;

	beforeEach(() => {
		getTimeWithOffsetStub = sandbox.stub(slots, 'getTimeWithOffset').returns(timeWithOffset);
		registerSecondSignatureTransaction = registerSecondSignature(secret, secondSecret);
	});

	it('should create a signature transaction', () => {
		(registerSecondSignatureTransaction).should.be.ok();
	});

	it('should use slots.getTimeWithOffset to calculate the timestamp', () => {
		(getTimeWithOffsetStub.calledWithExactly(undefined)).should.be.true();
	});

	it('should use slots.getTimeWithOffset with an offset of -10 seconds to calculate the timestamp', () => {
		const offset = -10;
		registerSecondSignature(secret, secondSecret, offset);

		(getTimeWithOffsetStub.calledWithExactly(offset)).should.be.true();
	});

	describe('returned signature transaction', () => {
		it('should be an object', () => {
			(registerSecondSignatureTransaction).should.be.type('object');
		});

		it('should have an id string', () => {
			(registerSecondSignatureTransaction).should.have.property('id').and.be.type('string');
		});

		it('should have type number equal to 1', () => {
			(registerSecondSignatureTransaction).should.have.property('type').and.be.type('number').and.equal(1);
		});

		it('should have amount number equal to 0', () => {
			(registerSecondSignatureTransaction).should.have.property('amount').and.be.type('number').and.equal(0);
		});

		it('should have fee number equal to signature fee', () => {
			(registerSecondSignatureTransaction).should.have.property('fee').and.be.type('number').and.equal(signatureFee);
		});

		it('should have recipientId equal to null', () => {
			(registerSecondSignatureTransaction).should.have.property('recipientId').and.be.null();
		});

		it('should have senderPublicKey hex string equal to sender public key', () => {
			(registerSecondSignatureTransaction).should.have.property('senderPublicKey').and.be.hexString().and.equal(publicKey);
		});

		it('should have timestamp number equal to result of slots.getTimeWithOffset', () => {
			(registerSecondSignatureTransaction).should.have.property('timestamp').and.be.type('number').and.equal(timeWithOffset);
		});

		it('should have signature hex string', () => {
			(registerSecondSignatureTransaction).should.have.property('signature').and.be.hexString();
		});

		it('should be signed correctly', () => {
			const result = cryptoModule.verifyTransaction(registerSecondSignatureTransaction);
			(result).should.be.ok();
		});

		it('should not be signed correctly if modified', () => {
			registerSecondSignatureTransaction.amount = 100;
			const result = cryptoModule.verifyTransaction(registerSecondSignatureTransaction);
			(result).should.be.not.ok();
		});

		it('should have asset object', () => {
			(registerSecondSignatureTransaction).should.have.property('asset').and.not.be.empty();
		});

		it('should not have a signSignature property', () => {
			(registerSecondSignatureTransaction).should.not.have.property('signSignature');
		});

		describe('signature asset', () => {
			it('should be an object', () => {
				(registerSecondSignatureTransaction.asset).should.have.property('signature')
					.and.be.type('object')
					.and.not.be.empty();
			});

			it('should have a 32-byte publicKey hex string', () => {
				(registerSecondSignatureTransaction.asset).should.have.property('signature')
					.with.property('publicKey')
					.and.be.hexString();
				(Buffer.from(registerSecondSignatureTransaction.asset.signature.publicKey, 'hex')).should.have.length(32);
			});

			it('should have a publicKey equal to the public key for the provided second secret', () => {
				(registerSecondSignatureTransaction.asset).should.have.property('signature')
					.with.property('publicKey')
					.and.equal(secondPublicKey);
			});

			it('should have the correct publicKey if the provided second secret is an empty string', () => {
				registerSecondSignatureTransaction = registerSecondSignature('secret', '');
				(registerSecondSignatureTransaction.asset.signature.publicKey).should.be.equal(
					emptyStringPublicKey,
				);
			});
		});
	});
});
