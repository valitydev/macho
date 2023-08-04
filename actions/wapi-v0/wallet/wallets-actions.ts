import { Wallet, WalletsApiFp } from '../../../api/wapi-v0/wallet/codegen';
import { WAPIDispatcher } from '../../../utils/codegen-utils';
import { getSimpleWalletParams } from '../../../api/wapi-v0/wallet/params/wallets-params/simple-wallet-params';
import { getWalletGrantParams } from '../../../api/wapi-v0/wallet/params/wallets-params/grant-params';
import until from '../../../utils/until';

export class WalletsActions {
    private api;
    private dispatcher: WAPIDispatcher;

    constructor(accessToken: string) {
        this.dispatcher = new WAPIDispatcher({
            headers: {
                origin: 'https://dashboard.stage.empayre.com'
            }
        });
        this.api = WalletsApiFp({
            apiKey: `Bearer ${accessToken}`
        });
    }

    async createNewWallet(
        identity: string,
        name: string = 'Test wallet name',
        currency: string = 'RUB'
    ): Promise<Wallet> {
        const walletParams = getSimpleWalletParams(identity, name, currency);
        return this.dispatcher.callMethod(this.api.createWallet, walletParams, undefined);
    }

    getWallet(walletID: string): Promise<Wallet> {
        return this.dispatcher.callMethod(this.api.getWallet, walletID, undefined);
    }

    async listWallets(partyID: string, identityID?: string) {
        return this.dispatcher.callMethod(
            this.api.listWallets,
            1000,
            undefined,
            partyID,
            identityID,
            undefined,
            undefined
        );
    }

    async getWalletAccount(walletID: string) {
        return this.dispatcher.callMethod(this.api.getWalletAccount, walletID, undefined);
    }

    async issueWalletGrant(walletID: string) {
        const grantParams = getWalletGrantParams();
        return this.dispatcher.callMethod(
            this.api.issueWalletGrant,
            walletID,
            grantParams,
            undefined
        );
    }

    async pollListWallets(partyID: string, identityID?: string) {
        return until(() => this.listWallets(partyID, identityID)).satisfy(list => {
            if (list.result.length < 1) {
                throw new Error('Request `listWallets` returned 0 wallets');
            }
        });
    }

}
