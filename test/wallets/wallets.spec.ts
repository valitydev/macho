import { WalletsActions } from '../../actions/wapi-v0/wallet';
import { AuthActions } from '../../actions';
import { IdentitiesActions } from '../../actions/wapi-v0';

describe('Wallets', () => {
    let walletsActions: WalletsActions;
    let identityActions: IdentitiesActions;

    before(async () => {
        const externalAccessToken = await AuthActions.authExternal();
        walletsActions = new WalletsActions(externalAccessToken);
        identityActions = new IdentitiesActions(externalAccessToken);
    });

    describe('Create new wallet', () => {
        let identityID: string;

        before(async () => {
            identityID = (await identityActions.createIdentity()).id;
        });

        it('should create new wallet', async () => {
            await walletsActions.createNewWallet(identityID);
        });
    });

    describe('Check wallet state', () => {
        let identityID: string;
        let walletID: string;

        before(async () => {
            identityID = (await identityActions.createIdentity()).id;
            walletID = (await walletsActions.createNewWallet(identityID)).id;
        });

        it('should get wallet', async () => {
            await walletsActions.getWallet(walletID);
        });

        it('get list wallets', async () => {
            await walletsActions.listWallets();
        });

        it("get list identity's wallets", async () => {
            await walletsActions.listWallets(identityID);
        });

        it('should get wallet account', async () => {
            await walletsActions.getWalletAccount(walletID);
        });

        it('should create new issue wallet grant', async () => {
            await walletsActions.issueWalletGrant(walletID);
        });
    });
});
