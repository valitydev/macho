import { PartiesActions } from '../actions/capi-v2';
import { AuthActions } from '../actions';

describe('Parties', () => {

    let accessToken: string;

    before(async () => {
        accessToken = await AuthActions.authExternal();
    });

    it('should return my party', async () => {
        const partiesActions = new PartiesActions(accessToken);
        let party = await partiesActions.getActiveParty();
        party.should.to.deep.include({
            isBlocked: false,
            isSuspended: false
        });
        party.should.to.have.property('id').to.be.a('string');
    });

});
