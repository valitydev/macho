import { PartiesActions } from '../actions/capi-v2';
import { AuthActions } from '../actions';

describe('Parties', () => {
    let accessToken: string;

    before(async () => {
        accessToken = await AuthActions.authExternal();
    });

    describe('getMyParty', () => {
        it('should return my party', async () => {
            const partiesActions = new PartiesActions(accessToken);
            await partiesActions.getActiveParty();
        });
    });
});
