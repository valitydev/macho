import { WAPIDispatcher } from '../../../../utils/codegen-utils';
import { WithdrawalEvent, WithdrawalsApiFp } from '../../../../api/wapi-v0/wallet/codegen';
import { EventActions } from '../../../event-actions';

export class WithdrawalsEventActions extends EventActions {
    private dispatcher: WAPIDispatcher;

    constructor(accessToken: string) {
        super();
        this.dispatcher = new WAPIDispatcher({
            headers: {
                origin: 'https://dashboard.stage.empayre.com'
            }
        });
        this.api = WithdrawalsApiFp({
            apiKey: `Bearer ${accessToken}`
        });
    }

    async getEvents(withdrawalID: string, limit: number = 1000, after?: number): Promise<WithdrawalEvent[]> {
        return await this.dispatcher.callMethod(
            this.api.pollWithdrawalEvents,
            withdrawalID,
            limit,
            undefined, // Deadline
            after
        );
    }
}
