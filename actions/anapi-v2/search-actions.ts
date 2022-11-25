import * as chai from 'chai';
import { Moment } from 'moment';
import {
    SearchApiFp,
    InlineResponse2008,
    InlineResponse2009,
    InlineResponse20010,
    InlineResponse20012
} from '../../api/anapi-v2/codegen';
import { anapiEndpoint } from '../../settings';
import { AuthActions } from '../auth-actions';
import { APIDispatcher } from '../../utils/codegen-utils';

chai.should();

function normalizeSearchResult(search: {result: null | Array<any>}): {result: Array<any>} {
    search.result = search.result || [];
    return search;
}

export class AnapiSearchActions {
    private api;
    private dispatcher: APIDispatcher;
    private static instance: AnapiSearchActions;

    static async getInstance(): Promise<AnapiSearchActions> {
        if (this.instance) {
            return this.instance;
        }
        const token = await AuthActions.getInstance().getExternalAccessToken();
        this.instance = new AnapiSearchActions(token);
        return this.instance;
    }

    constructor(exToken: string) {
        this.dispatcher = new APIDispatcher(`${anapiEndpoint}/v2`, {
            headers: {
                'content-type': 'application/json; charset=utf-8',
                'origin': 'https://dashboard.stage.empayre.com'
            }
        });
        this.api = SearchApiFp({
            apiKey: `Bearer ${exToken}`
        });
    }

    searchPayments(query: {
        partyID: string,
        fromTime: Moment,
        toTime: Moment,
        limit: number,
        paymentInstitutionRealm: 'test' | 'live';
        shopID?: string,
        paymentStatus?: 'pending' | 'processed' | 'captured' | 'cancelled' | 'failed',
        paymentFlow?: 'instant' | 'hold',
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
        externalID?: string,
        continuationToken?: string
    }): Promise<InlineResponse2009> {
        return this.dispatcher.callMethod(
            this.api.searchPayments,
            query.partyID,                 // partyID: string
            query.fromTime,                // fromTime: Date
            query.toTime,                  // toTime: Date
            query.limit,                   // limit: number
            undefined,                     // xRequestDeadline?: string
            query.shopID,                  // shopID?: string
            undefined,                     // shopIDs?: Array<string>
            undefined,                     // excludeShopIDs?: Array<string>
            query.paymentInstitutionRealm, // paymentInstitutionRealm?: string
            query.invoiceID,               // invoiceID?: string
            undefined,                     // invoiceIDs?: Array<string>
            query.paymentID,               // paymentID?: string
            query.paymentStatus,           // paymentStatus?: string
            query.paymentFlow,             // paymentFlow?: string
            query.paymentMethod,           // paymentMethod?: string
            query.paymentTerminalProvider, // paymentTerminalProvider?: string
            query.payerEmail,              // payerEmail?: string
            query.payerIP,                 // payerIP?: string
            query.payerFingerprint,        // payerFingerprint?: string
            query.customerID,              // customerID?: string
            query.first6,                  // first6?: string
            query.last4,                   // last4?: string
            query.rrn,                     // rrn?: string
            query.approvalCode,            // approvalCode?: string
            query.bankCardTokenProvider,   // bankCardTokenProvider?: string
            query.bankCardPaymentSystem,   // bankCardPaymentSystem?: string
            query.paymentAmountFrom,       // paymentAmountFrom?: number
            query.paymentAmountTo,         // paymentAmountTo?: number
            query.externalID,              // externalID?: string
            query.continuationToken        // continuationToken?: ContinuationToken
        ).then(normalizeSearchResult);
    }

    searchInvoices(query: {
        partyID: string;
        fromTime: Moment;
        toTime: Moment;
        limit: number;
        paymentInstitutionRealm: 'test' | 'live';
        shopID?: string;
        invoiceStatus?: 'unpaid' | 'paid' | 'cancelled' | 'fulfilled';
        invoiceID?: string;
        invoiceAmountFrom?: number;
        invoiceAmountTo?: number;
        externalID?: string,
        continuationToken?: string;
    }): Promise<InlineResponse2008> {
        return this.dispatcher.callMethod(
            this.api.searchInvoices,
            query.partyID,                 // partyID: string
            query.fromTime,                // fromTime: Date
            query.toTime,                  // toTime: Date
            query.limit,                   // limit: number
            undefined,                     // xRequestDeadline?: string
            query.shopID,                  // shopID?: string
            undefined,                     // shopIDs?: Array<string>
            query.paymentInstitutionRealm, // paymentInstitutionRealm?: string
            query.invoiceID,               // invoiceID?: string
            undefined,                     // invoiceIDs?: Array<string>
            query.invoiceStatus,           // invoiceStatus?: string
            query.invoiceAmountFrom,       // invoiceAmountFrom?: number
            query.invoiceAmountTo,         // invoiceAmountTo?: number,
            query.externalID,              // externalID?: string
            query.continuationToken        // continuationToken?: ContinuationToken
        ).then(normalizeSearchResult);
    }

    searchRefunds(query: {
        partyID: string,
        fromTime: Moment,
        toTime: Moment,
        limit: number,
        paymentInstitutionRealm: 'test' | 'live';
        shopID?: string,
        invoiceID?: string,
        paymentID?: string,
        refundID?: string,
        refundStatus?: 'pending' | 'succeeded' | 'failed',
        externalID?: string,
        continuationToken?: string
    }): Promise<InlineResponse20010> {
        return this.dispatcher.callMethod(
            this.api.searchRefunds,
            query.partyID,                 // partyID: string
            query.fromTime,                // fromTime: Date
            query.toTime,                  // toTime: Date
            query.limit,                   // limit: number
            undefined,                     // xRequestDeadline?: string
            query.shopID,                  // shopID?: string
            undefined,                     // shopIDs?: Array<string>
            query.paymentInstitutionRealm, // paymentInstitutionRealm?: string
            query.invoiceID,               // invoiceID?: string
            undefined,                     // invoiceIDs?: Array<string>
            query.paymentID,               // paymentID?: string
            query.refundID,                // refundID?: string
            query.refundStatus,            // refundStatus?: string
            query.externalID,              // externalID?: string
            query.continuationToken        // continuationToken?: ContinuationToken
        ).then(normalizeSearchResult);
    }

    searchPayouts(query: {
        partyID: string,
        fromTime: Moment,
        toTime: Moment,
        limit: number,
        paymentInstitutionRealm: 'test' | 'live';
        shopID?: string,
        payoutID?: string,
        payoutToolType?: string,
        continuationToken?: string
    }): Promise<InlineResponse20012> {
        return this.dispatcher.callMethod(
            this.api.searchPayouts,
            query.partyID,                 // partyID: string
            query.fromTime,                // fromTime: Date
            query.toTime,                  // toTime: Date
            query.limit,                   // limit: number
            undefined,                     // xRequestDeadline?: string
            query.shopID,                  // shopID?: string
            undefined,                     // shopIDs?: Array<string>
            query.paymentInstitutionRealm, // paymentInstitutionRealm?: string
            query.payoutID,                // payoutID?: string
            query.payoutToolType,          // payoutToolType?: string
            query.continuationToken        // continuationToken?: ContinuationToken
        ).then(normalizeSearchResult);
    }
}
