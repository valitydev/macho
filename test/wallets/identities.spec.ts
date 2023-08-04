import chai from 'chai';
import { IdentitiesActions } from '../../actions/wapi-v0';
import { AuthActions, PartiesActions } from '../../actions';

chai.should();

describe('Identities', () => {
    let identitiesActions: IdentitiesActions;
    let partyID: string;

    before(async () => {
        const externalAccessToken = await AuthActions.authExternal();
        identitiesActions = new IdentitiesActions(externalAccessToken);
        const partiesActions = new PartiesActions(externalAccessToken);
        const party = await partiesActions.getActiveParty();
        partyID = party.id;
    });

    it('should create new identity', async () => {
        const identity = await identitiesActions.createIdentity(partyID);
        identity.should.have.property('id').that.is.a('string');
        identity.should.have.property('isBlocked').equal(false);
        identity.should.contain.keys('createdAt', 'name', 'provider');
    });

    it('should get identity', async () => {
        const identityID = (await identitiesActions.createIdentity(partyID)).id;
        const identity = await identitiesActions.getIdentity(identityID);
        identity.should.have.property('id').equal(identityID);
        identity.should.contain.keys('createdAt', 'name', 'provider');
    });

    it('should list identities', async () => {
        const identity = await identitiesActions.createIdentity(partyID);
        const list = await identitiesActions.listIdentities(partyID);
        list.should.have.property('result');
        list.result.should.have.property('length').greaterThan(0);
        list.result[0].should.have.property('id').equal(identity.id);
        list.result[0].should.have.property('isBlocked').equal(identity.isBlocked);
        list.result[0].should.have.property('provider').equal(identity.provider);
    });
});
