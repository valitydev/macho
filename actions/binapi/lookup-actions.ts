import * as chai from 'chai';
import { CardInfo, CardNumber, SearchApiFp } from '../../api/binapi/codegen';
import guid from '../../utils/guid';
import { binapiEndpoint } from '../../settings';
import { handleResponseError } from '../../utils';
import { AuthActions } from '../auth-actions';

chai.should();

const binapi_version = 'v1';

export class BinapiLookupActions {
    private api;
    private static instance: BinapiLookupActions;

    static async getInstance(): Promise<BinapiLookupActions> {
        if (this.instance) {
            return this.instance;
        }
        const token = await AuthActions.getInstance().getExternalAccessToken();
        this.instance = new BinapiLookupActions(token);
        return this.instance;
    }

    constructor(exToken: string) {
        this.api = SearchApiFp({
            apiKey: `Bearer ${exToken}`
        });
    }

    lookupCardInfo(cardNumber?: string): Promise<CardInfo> {
        const xRequestID = guid();
        const xRequestDeadline = undefined;
        const cardData: CardNumber = {
            cardNumber
        };
        return this.api
            .lookupCardInfo(cardData, xRequestDeadline)(
                undefined,
                `${binapiEndpoint}/${binapi_version}`
            )
            .catch(ex => handleResponseError(ex, xRequestID));
    }
}
