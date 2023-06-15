import * as chai from 'chai';
import { PartiesApiFp, Party } from '../../api/capi-v2/codegen';
import { CAPIDispatcher } from '../../utils/codegen-utils';
import { AuthActions } from '../auth-actions';
import { testPartyID } from '../../settings';

chai.should();

export class PartiesActions {
    private api;
    private dispatcher: CAPIDispatcher;
    private static instance: PartiesActions;

    static async getInstance(): Promise<PartiesActions> {
        if (this.instance) {
            return this.instance;
        }
        const token = await AuthActions.getInstance().getExternalAccessToken();
        this.instance = new PartiesActions(token);
        return this.instance;
    }

    constructor(accessToken: string) {
        this.dispatcher = new CAPIDispatcher({
            headers: {
                origin: 'https://dashboard.stage.empayre.com'
            }
        });
        this.api = PartiesApiFp({
            apiKey: `Bearer ${accessToken}`
        });
    }

    getActiveParty(): Promise<Party> {
        return this.dispatcher.callMethod(this.api.getPartyByID, testPartyID).then(party => {
            party.should.to.have.property('id').to.be.a('string');
            return party;
        });
    }
}
