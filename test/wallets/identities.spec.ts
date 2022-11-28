import chai from 'chai';
import { IdentitiesActions } from '../../actions/wapi-v0';
import { AuthActions } from '../../actions';

chai.should();

describe('Identities', () => {
    let identitiesActions: IdentitiesActions;

    before(async () => {
        const externalAccessToken = await AuthActions.authExternal();
        identitiesActions = new IdentitiesActions(externalAccessToken);
    });

    it('should create new identity', async () => {
        const identity = await identitiesActions.createIdentity();
        identity.should.have.property('id').that.is.a('string');
        identity.should.have.property('isBlocked').equal(false);
        identity.should.contain.keys('createdAt', 'name', 'provider');
    });

    it('should get identity', async () => {
        const identityID = (await identitiesActions.createIdentity()).id;
        const identity = await identitiesActions.getIdentity(identityID);
        identity.should.have.property('id').equal(identityID);
        identity.should.contain.keys('createdAt', 'name', 'provider');
    });

    it('should list identities', async () => {
        const list = await identitiesActions.listIdentities(1000);
        list.should.contain.keys('result');
    });

});
