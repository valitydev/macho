import { WAPIDispatcher } from '../../../../utils/codegen-utils';
import { WithdrawalEvent, WithdrawalsApiFp } from '../../../../api/wapi-v0/wallet/codegen';
import { EventActions } from '../../../event-actions';

export class WithdrawalsEventActions extends EventActions {
    private dispatcher: WAPIDispatcher;

    constructor(accessToken: string) {
        super();
        this.dispatcher = new WAPIDispatcher({});
        this.api = WithdrawalsApiFp({
            apiKey: `Bearer ${accessToken}`
        });
    }

    async getEvents(...args: any[]): Promise<WithdrawalEvent[]> {
        return await this.dispatcher.callMethod(
            this.api.pollWithdrawalEvents,
            ...args,
            1000,
            undefined,
            undefined
        );
    }
}
