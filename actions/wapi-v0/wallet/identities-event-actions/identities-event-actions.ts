import { WAPIDispatcher } from '../../../../utils/codegen-utils';
import { IdentitiesApiFp, IdentityChallengeEvent } from '../../../../api/wapi-v0/wallet/codegen';
import { EventActions } from '../../../event-actions';

export class IdentitiesEventActions extends EventActions {
    private dispatcher: WAPIDispatcher;

    constructor(accessToken: string) {
        super();
        this.dispatcher = new WAPIDispatcher({});
        this.api = IdentitiesApiFp({
            apiKey: `Bearer ${accessToken}`
        });
    }

    async getEvents(...args: any[]): Promise<IdentityChallengeEvent[]> {
        return await this.dispatcher.callMethod(
            this.api.pollIdentityChallengeEvents,
            ...args,
            1000,
            undefined,
            undefined
        );
    }
}
