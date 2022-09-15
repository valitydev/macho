import * as chai from 'chai';
import { PapiFactory, Payout, PayoutsApiForTests } from '../../api/papi-v1';
import { AuthActions } from '../auth-actions';
import delay from '../../utils/delay';

chai.should();

export class PapiPayoutsActions {
    private api: PayoutsApiForTests;
    private static instance: PapiPayoutsActions;

    static async getInstance(): Promise<PapiPayoutsActions> {
        if (this.instance) {
            return this.instance;
        }
        const token = await AuthActions.getInstance().getInternalAccessToken();
        this.instance = new PapiPayoutsActions(token);
        return this.instance;
    }

    constructor(accessToken: string) {
        this.api = PapiFactory.getInstance(PayoutsApiForTests.name, accessToken);
    }

    async getPayoutWhenPresent(partyID: string, shopID: string): Promise<Payout> {
        const payout = await Promise.race([delay(20000), this.pollSearchPayouts(partyID, shopID)]);
        if (!payout) {
            throw new Error('Wait searchPayouts result timeout');
        }
        return payout;
    }

    pay(payoutIds: string[]) {
        return this.api.pay(payoutIds);
    }

    confirmPayouts(payoutIds: string[]) {
        return this.api.confirmPayouts(payoutIds);
    }

    private async pollSearchPayouts(partyID: string, shopID: string): Promise<Payout> {
        let result;
        while (!result) {
            const payouts = await this.api.searchPayoutsForTests();
            result = payouts.find(
                ({ partyId, shopId }) => partyId === partyID && shopId === shopID
            );
            await delay(1000);
        }
        return result;
    }
}
