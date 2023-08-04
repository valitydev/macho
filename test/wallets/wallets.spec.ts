import chai from 'chai';
import { WalletsActions } from '../../actions/wapi-v0/wallet';
import { AuthActions, PartiesActions } from '../../actions';
import { IdentitiesActions } from '../../actions/wapi-v0';
import until from '../../utils/until';

chai.should();

describe('Wallets', () => {
    let walletsActions: WalletsActions;
    let identityActions: IdentitiesActions;
    let partyID: string;

    before(async () => {
        const externalAccessToken = await AuthActions.authExternal();
        walletsActions = new WalletsActions(externalAccessToken);
        identityActions = new IdentitiesActions(externalAccessToken);
        const partiesActions = new PartiesActions(externalAccessToken);
        const party = await partiesActions.getActiveParty();
        partyID = party.id;
    });

    describe('Create new wallet', () => {
        let identityID: string;

        before(async () => {
            identityID = (await identityActions.createIdentity(partyID)).id;
        });

        it('should create new wallet', async () => {
            const wallet = await walletsActions.createNewWallet(identityID);
            wallet.should.have.property('id').that.is.a('string');
            wallet.should.have.property('identity').equal(identityID);
            wallet.should.contain.keys('name', 'currency');
        });
    });

    describe('Check wallet state', () => {
        let identityID: string;
        let walletID: string;

        before(async () => {
            identityID = (await identityActions.createIdentity(partyID)).id;
            walletID = (await walletsActions.createNewWallet(identityID)).id;
        });

        it('should get wallet', async () => {
            const wallet = await walletsActions.getWallet(walletID);
            wallet.should.have.property('id').equal(walletID);
            wallet.should.have.property('identity').equal(identityID);
            wallet.should.contain.keys('name', 'currency');
        });

        it('list wallets', async () => {
            const list = await walletsActions.listWallets(partyID);
            list.should.have.property('result');
            list.result.should.have.property('length').that.is.a('number');
        });

        it("list identity's wallets", async () => {
            const list = await walletsActions.pollListWallets(partyID, identityID);
            list.should.have.property('result');
            list.result.should.have.property('length').greaterThan(0);
            list.result[0].should.have.property('identity').equal(identityID);
        });

        it('should get wallet account', async () => {
            const walletAccount = await await walletsActions.getWalletAccount(walletID);
            walletAccount.should.contain.keys('available', 'own');
        });

        it('should create new issue wallet grant', async () => {
            const grant = await walletsActions.issueWalletGrant(walletID);
            grant.should.contain.keys('token', 'validUntil', 'asset');
        });
    });
});
