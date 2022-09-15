import { PaymentFlow, PaymentParams, CaptureParams, Payer } from '../../codegen';
import TypeEnum = PaymentFlow.TypeEnum;
import { Payment } from '../../';
import { assertPayer } from './payer-params';

function getFlow(paymentType: TypeEnum, holdType?: string) {
    switch (paymentType) {
        case TypeEnum.PaymentFlowHold:
            return {
                type: paymentType,
                onHoldExpiration: holdType === undefined ? 'capture' : holdType
            };
        case TypeEnum.PaymentFlowInstant:
        default:
            return {
                type: paymentType
            };
    }
}

export function paymentParams(
    payer: Payer,
    paymentType: TypeEnum,
    makeRecurrent: boolean,
    holdType?: string,
    externalID?: string,
    metadata?: object
): PaymentParams {
    return {
        externalID,
        flow: getFlow(paymentType, holdType),
        payer: payer,
        makeRecurrent: makeRecurrent,
        metadata: metadata
    };
}

export function captureParams(amount?: number): CaptureParams {
    return amount === undefined
        ? {
              reason: 'testCapture'
          }
        : {
              reason: 'testCapture',
              amount: amount,
              currency: 'RUB'
          };
}

export function assertPayment(
    payment: Payment,
    amount: number,
    paymentType: TypeEnum,
    holdType?: string,
    metadata?: object
) {
    payment.should.to.include({
        amount: amount,
        currency: 'RUB'
    });
    if (metadata != undefined) {
        payment.should.have.deep.property('metadata', metadata);
    }
    payment.flow.should.to.include(getFlow(paymentType, holdType));
    payment.should.to.have.property('status').to.be.a('string');
    payment.should.to.have.property('id').to.be.a('string');
    payment.should.to.have.property('createdAt').to.be.a('string');
    payment.should.to.have.property('invoiceID').to.be.a('string');
    payment.should.to.have.property('payer').to.be.a('object');
    payment.should.to.have.property('makeRecurrent').to.be.a('boolean');
    assertPayer(payment.payer);
}
