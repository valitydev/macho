import {
    PaymentResource,
    PaymentResourcePayer,
    PaymentRecurrentParent,
    RecurrentPayer,
    CustomerPayer,
    Payer
} from '../../codegen';

export function paymentResourcePayer(payload: PaymentResource): PaymentResourcePayer {
    return {
        payerType: 'PaymentResourcePayer',
        paymentToolToken: payload.paymentToolToken,
        paymentSession: payload.paymentSession,
        contactInfo: {
            email: 'user@example.com'
        }
    } as PaymentResourcePayer;
}

export function recurrentPayer(payload: PaymentRecurrentParent): RecurrentPayer {
    return {
        payerType: 'RecurrentPayer',
        recurrentParentPayment: payload,
        contactInfo: {
            email: 'user@example.com'
        }
    } as RecurrentPayer;
}

export function assertPayer(payer: Payer) {
    switch (payer.payerType) {
        case 'PaymentResourcePayer':
            payer.should.to.deep.include({
                contactInfo: {
                    email: 'user@example.com'
                }
            });
            payer.should.to.have.property('paymentSession').to.be.a('string');
            payer.should.to.have.property('paymentToolToken').to.be.a('string');
            payer.should.to.have.property('paymentToolDetails').to.be.a('object');
            payer.should.to.have.property('contactInfo').to.be.a('object');
            payer.should.to.have.property('clientInfo').to.be.a('object');
            return;
        case 'RecurrentPayer':
            payer.should.to.deep.include({
                contactInfo: {
                    email: 'user@example.com'
                }
            });
            payer.should.to.have.property('contactInfo').to.be.a('object');
            payer.should.to.have.property('paymentToolToken').to.be.a('string');
            payer.should.to.have.property('paymentToolDetails').to.be.a('object');
            const parent = (payer as RecurrentPayer).recurrentParentPayment;
            parent.should.to.have.property('invoiceID').to.be.a('string');
            parent.should.to.have.property('paymentID').to.be.a('string');
            return;
        case 'CustomerPayer':
            payer.should.to.deep.include({
                contactInfo: {
                    email: 'user@example.com'
                }
            });
            payer.should.to.have.property('customerID').to.be.a('string');
            payer.should.to.have.property('paymentToolToken').to.be.a('string');
            payer.should.to.have.property('paymentToolDetails').to.be.a('object');
            return;
    }
}
