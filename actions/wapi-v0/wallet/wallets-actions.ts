import * as chai from 'chai';
import { Wallet, WalletsApiFp } from '../../../api/wapi-v0/wallet/codegen';
import { WAPIDispatcher } from '../../../utils/codegen-utils';
import { getSimpleWalletParams } from '../../../api/wapi-v0/wallet/params/wallets-params/simple-wallet-params';
import { getWalletGrantParams } from '../../../api/wapi-v0/wallet/params/wallets-params/grant-params';

chai.should();

export class WalletsActions {
    private api;
    private dispatcher: WAPIDispatcher;

    constructor(accessToken: string) {
        this.dispatcher = new WAPIDispatcher({});
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
        const createdWallet = await this.dispatcher.callMethod(
            this.api.createWallet,
            walletParams,
            undefined
        );
        createdWallet.should.contain.keys('name', 'currency', 'identity');
        return createdWallet;
    }

    getWallet(walletID: string): Promise<Wallet> {
        return this.dispatcher.callMethod(this.api.getWallet, walletID, undefined);
    }

    async listWallets(identityID?: string) {
        const wallets = await Promise.race([
            this.pollWallets(identityID),
            new Promise(res => setTimeout(res, 20000))
        ]);
        if (wallets) {
            return wallets;
        }
        throw new Error('list wallets polling timeout');
    }

    async getWalletAccount(walletID: string) {
        const walletAccount = await this.dispatcher.callMethod(
            this.api.getWalletAccount,
            walletID,
            undefined
        );
        walletAccount.should.contain.keys('available', 'own');
        return walletAccount;
    }

    async issueWalletGrant(walletID: string) {
        const grantParams = getWalletGrantParams();
        const grant = await this.dispatcher.callMethod(
            this.api.issueWalletGrant,
            walletID,
            grantParams,
            undefined
        );
        grant.should.contain.keys('token', 'validUntil', 'asset');
        return grant;
    }

    async pollWallets(identityID?: string) {
        let result;
        while (!result || result.length === 0) {
            result = (await this.dispatcher.callMethod(
                this.api.listWallets,
                1000,
                undefined,
                identityID,
                undefined,
                undefined
            )).result;
            await new Promise(res => setTimeout(res, 3000));
        }
        return result;
    }
}
