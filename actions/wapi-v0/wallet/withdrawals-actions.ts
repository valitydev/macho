import {
    Destination,
    WithdrawalParameters,
    WithdrawalsApiFp
} from '../../../api/wapi-v0/wallet/codegen';
import { WAPIDispatcher } from '../../../utils/codegen-utils';
import { getWithdrawalGrantParams } from '../../../api/wapi-v0/wallet/params/wallets-params/grant-params';
import delay from '../../../utils/delay';

export class WithdrawalsActions {
    private api;
    private dispatcher: WAPIDispatcher;

    constructor(accessToken: string) {
        this.dispatcher = new WAPIDispatcher({});
        this.api = WithdrawalsApiFp({
            apiKey: `Bearer ${accessToken}`
        });
    }

    async listDestinations(
        limit: number,
        identityID?: string,
        currencyID?: string,
        continuationToken?: string
    ) {
        return this.dispatcher.callMethod(
            this.api.listDestinations,
            limit,
            identityID,
            currencyID,
            continuationToken,
            undefined
        );
    }

    async createDestination(destination: Destination) {
        return this.dispatcher.callMethod(this.api.createDestination, destination, undefined);
    }

    async listWithdrawals(
        limit: number,
        walletID?: string,
        identityID?: string,
        withdrawalID?: string,
        destinationID?: string,
        status?: string,
        createdAtFrom?: Date,
        createdAtTo?: Date,
        amountFrom?: number,
        amountTo?: number,
        currencyID?: string,
        continuationToken?: string
    ) {
        return this.dispatcher.callMethod(
            this.api.listWithdrawals,
            limit,
            undefined,
            walletID,
            identityID,
            withdrawalID,
            destinationID,
            status,
            createdAtFrom,
            createdAtTo,
            amountFrom,
            amountTo,
            currencyID,
            continuationToken
        );
    }

    async createWithdrawal(withdrawalParams: WithdrawalParameters) {
        return await this.dispatcher.callMethod(
            this.api.createWithdrawal,
            withdrawalParams,
            undefined
        );
    }

    async getDestination(destinationID: string) {
        return this.dispatcher.callMethod(this.api.getDestination, destinationID, undefined);
    }

    async issueDestinationGrant(destinationID: string) {
        const grantParams = getWithdrawalGrantParams();
        return this.dispatcher.callMethod(
            this.api.issueDestinationGrant,
            destinationID,
            grantParams,
            undefined
        );
    }

    async getWithdrawal(withdrawalID: string) {
        return this.dispatcher.callMethod(this.api.getWithdrawal, withdrawalID, undefined);
    }

    async getWithdrawalByExternal(externalID: string) {
        return this.dispatcher.callMethod(
            this.api.getWithdrawalByExternalID,
            externalID,
            undefined
        );
    }

    async pollWithdrawalEvents(withdrawalID: string) {
        return this.dispatcher.callMethod(
            this.api.pollWithdrawalEvents,
            withdrawalID,
            1000,
            undefined,
            undefined
        );
    }

    async getWithdrawalEvent(withdrawalID: string, eventID: string) {
        return this.dispatcher.callMethod(
            this.api.getWithdrawalEvents,
            withdrawalID,
            eventID,
            undefined
        );
    }

}
