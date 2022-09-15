import * as chai from 'chai';
import { Moment } from 'moment';
import {
    SearchApiFp,
    InlineResponse2001,
    InlineResponse200,
    InlineResponse2003,
    InlineResponse2002
} from '../../api/anapi/codegen';
import guid from '../../utils/guid';
import { anapiEndpoint } from '../../settings';
import { handleResponseError } from '../../utils';
import { AuthActions } from '../auth-actions';

chai.should();

const anapi_version = 'v1';

export class AnapiSearchActions {
    private api;
    private static instance: AnapiSearchActions;

    static async getInstance(): Promise<AnapiSearchActions> {
        if (this.instance) {
            return this.instance;
        }
        const token = await AuthActions.getInstance().getExternalAccessToken();
        this.instance = new AnapiSearchActions(token);
        return this.instance;
    }

    private constructor(exToken: string) {
        this.api = SearchApiFp({
            apiKey: `Bearer ${exToken}`
        });
    }

    searchPayments(
        partyID: string,
        fromTime: Moment,
        toTime: Moment,
        limit: number,
        shopID?: string,
        paymentStatus?: string,
        paymentFlow?: string,
        paymentMethod?: string,
        paymentTerminalProvider?: string,
        invoiceID?: string,
        paymentID?: string,
        payerEmail?: string,
        payerIP?: string,
        payerFingerprint?: string,
        customerID?: string,
        first6?: string,
        last4?: string,
        rrn?: string,
        approvalCode?: string,
        bankCardTokenProvider?: string,
        bankCardPaymentSystem?: string,
        paymentAmountTo?: number,
        paymentAmountFrom?: number,
        excludedShops?: Array<string>,
        continuationToken?: string
    ): Promise<InlineResponse2001> {
        const xRequestID = guid();
        const xRequestDeadline = undefined;
        const shopIDs = undefined;
        const paymentInstitutionRealm = undefined;
        const invoiceIDs = undefined;
        const externalID = undefined;
        return this.api
            .searchPayments(
                xRequestID,
                partyID,
                fromTime,
                toTime,
                limit,
                xRequestDeadline,
                shopID,
                shopIDs,
                paymentInstitutionRealm,
                invoiceIDs,
                paymentStatus,
                paymentFlow,
                paymentMethod,
                paymentTerminalProvider,
                invoiceID,
                paymentID,
                externalID,
                payerEmail,
                payerIP,
                payerFingerprint,
                customerID,
                first6,
                last4,
                rrn,
                approvalCode,
                bankCardTokenProvider,
                bankCardPaymentSystem,
                paymentAmountFrom,
                paymentAmountTo,
                excludedShops,
                continuationToken
            )(undefined, `${anapiEndpoint}/${anapi_version}`)
            .catch(ex => handleResponseError(ex, xRequestID));
    }

    searchInvoices(
        partyID: string,
        fromTime: Moment,
        toTime: Moment,
        limit: number,
        shopID?: string,
        invoiceStatus?: string,
        invoiceID?: string,
        invoiceAmountFrom?: number,
        invoiceAmountTo?: number,
        excludedShops?: Array<string>,
        continuationToken?: string
    ): Promise<InlineResponse200> {
        const xRequestID = guid();
        const xRequestDeadline = undefined;
        const shopIDs = undefined;
        const paymentInstitutionRealm = undefined;
        const invoiceIDs = undefined;
        const externalID = undefined;
        return this.api
            .searchInvoices(
                xRequestID,
                partyID,
                fromTime,
                toTime,
                limit,
                xRequestDeadline,
                shopID,
                shopIDs,
                paymentInstitutionRealm,
                invoiceIDs,
                invoiceStatus,
                invoiceID,
                externalID,
                invoiceAmountFrom,
                invoiceAmountTo,
                excludedShops,
                continuationToken
            )(undefined, `${anapiEndpoint}/${anapi_version}`)
            .catch(ex => handleResponseError(ex, xRequestID));
    }

    searchRefunds(
        partyID: string,
        fromTime: Moment,
        toTime: Moment,
        limit: number,
        shopID?: string,
        offset?: number,
        invoiceID?: string,
        paymentID?: string,
        refundID?: string,
        refundStatus?: string,
        excludedShops?: Array<string>,
        continuationToken?: string
    ): Promise<InlineResponse2003> {
        const xRequestID = guid();
        const xRequestDeadline = undefined;
        const shopIDs = undefined;
        const paymentInstitutionRealm = undefined;
        const invoiceIDs = undefined;
        const externalID = undefined;
        return this.api
            .searchRefunds(
                xRequestID,
                partyID,
                fromTime,
                toTime,
                limit,
                xRequestDeadline,
                shopID,
                shopIDs,
                paymentInstitutionRealm,
                offset,
                invoiceIDs,
                invoiceID,
                paymentID,
                refundID,
                externalID,
                refundStatus,
                excludedShops,
                continuationToken
            )(undefined, `${anapiEndpoint}/${anapi_version}`)
            .catch(ex => handleResponseError(ex, xRequestID));
    }

    searchPayouts(
        partyID: string,
        fromTime: Moment,
        toTime: Moment,
        limit: number,
        shopID?: string,
        offset?: number,
        payoutID?: string,
        payoutToolType?: string,
        excludedShops?: Array<string>,
        continuationToken?: string
    ): Promise<InlineResponse2002> {
        const xRequestID = guid();
        const xRequestDeadline = undefined;
        const shopIDs = undefined;
        const paymentInstitutionRealm = undefined;
        const invoiceIDs = undefined;
        const externalID = undefined;
        return this.api
            .searchPayouts(
                xRequestID,
                partyID,
                fromTime,
                toTime,
                limit,
                xRequestDeadline,
                shopID,
                shopIDs,
                paymentInstitutionRealm,
                offset,
                payoutID,
                payoutToolType,
                excludedShops,
                continuationToken
            )(undefined, `${anapiEndpoint}/${anapi_version}`)
            .catch(ex => handleResponseError(ex, xRequestID));
    }
}
