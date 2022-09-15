import * as chai from 'chai';
import {
    Destination,
    WithdrawalParameters,
    WithdrawalsApiFp
} from '../../../api/wapi-v0/wallet/codegen';
import { WAPIDispatcher } from '../../../utils/codegen-utils';
import { getWithdrawalGrantParams } from '../../../api/wapi-v0/wallet/params/wallets-params/grant-params';
import delay from '../../../utils/delay';

chai.should();

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
        const destination = await this.dispatcher.callMethod(
            this.api.listDestinations,
            limit,
            identityID,
            currencyID,
            continuationToken,
            undefined
        );
        destination.should.contain.keys('result');
        return destination;
    }

    async createDestination(destination: Destination) {
        const dest = await this.dispatcher.callMethod(
            this.api.createDestination,
            destination,
            undefined
        );
        dest.should.contain.keys('name', 'identity', 'currency', 'resource');
        return dest;
    }

    async createDestinationError(destination: Destination) {
        return this.dispatcher
            .callMethod(this.api.createDestination, destination, undefined)
            .catch(error => {
                return error;
            });
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
        const withdrawals = await this.dispatcher.callMethod(
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
        withdrawals.should.contain.keys('result');
        return withdrawals;
    }

    async createWithdrawal(withdrawalParams: WithdrawalParameters) {
        return await this.dispatcher.callMethod(
            this.api.createWithdrawal,
            withdrawalParams,
            undefined
        );
    }

    async getDestination(destinationID: string) {
        const destination = await this.dispatcher.callMethod(
            this.api.getDestination,
            destinationID,
            undefined
        );
        destination.should.contain.keys('name', 'identity', 'currency', 'resource');
        return destination;
    }

    async issueDestinationGrant(destinationID: string) {
        const grantParams = getWithdrawalGrantParams();
        const grant = await this.dispatcher.callMethod(
            this.api.issueDestinationGrant,
            destinationID,
            grantParams,
            undefined
        );
        grant.should.contain.keys('token', 'validUntil');
        return grant;
    }

    async getWithdrawal(withdrawalID: string) {
        const withdrawal = await this.dispatcher.callMethod(
            this.api.getWithdrawal,
            withdrawalID,
            undefined
        );
        withdrawal.should.contain.keys('wallet', 'destination', 'body');
        return withdrawal;
    }

    async getWithdrawalByExternal(externalID: string) {
        const withdrawal = await this.dispatcher.callMethod(
            this.api.getWithdrawalByExternalID,
            externalID,
            undefined
        );
        withdrawal.should.contain.keys('wallet', 'destination', 'body', 'externalID');
        return withdrawal;
    }

    async pollWithdrawalEvents(withdrawalID: string) {
        const events = await this.dispatcher.callMethod(
            this.api.pollWithdrawalEvents,
            withdrawalID,
            1000,
            undefined,
            undefined
        );
        events.should.property('length').not.equal(0);
        events[0].should.contain.keys('eventID', 'occuredAt', 'changes');
        return events;
    }

    async getWithdrawalEvents(withdrawalID: string, eventID: string) {
        const event = await this.dispatcher.callMethod(
            this.api.getWithdrawalEvents,
            withdrawalID,
            eventID,
            undefined
        );
        event.should.contain.keys('changes', 'eventID', 'occuredAt');
        return event;
    }

    async waitDestinationCreate(destinationID: string) {
        let result = await Promise.race([
            new Promise(res => setTimeout(res, 10000)),
            this.pollDestinationCreation(destinationID)
        ]);
        if (result) {
            return result;
        }
        throw 'poll destination create timeout';
    }

    async pollDestinationCreation(destinationID: string) {
        let isCreated;
        while (!isCreated) {
            isCreated = (await this.getDestination(destinationID)).id;
            await delay(1500);
        }
        return isCreated;
    }
}
