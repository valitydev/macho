import { ChangeIdentityCondition } from './wapi-v0/wallet/identities-event-actions';
import {
    IdentityChallengeEvent,
    IdentityChallengeStatusChanged,
    WithdrawalEvent,
    WithdrawalStatus
} from '../api/wapi-v0/wallet/codegen';
import { InvoiceChange, InvoiceEvent } from '../api/capi-v2/codegen';
import { ChangeInvoiceCondition } from './capi-v2/invoice-event-actions';
import { ChangeWithdrawalCondition } from './wapi-v0/wallet/withdrawals-event-actions';
import delay from '../utils/delay';

type ChangeCondition = ChangeIdentityCondition | ChangeInvoiceCondition | ChangeWithdrawalCondition;
type EventStatusChanged = IdentityChallengeStatusChanged | InvoiceChange | WithdrawalStatus;
type Event = IdentityChallengeEvent | InvoiceEvent | WithdrawalEvent;

export abstract class EventActions {
    protected api;

    protected constructor() {}

    async waitConditions(
        conditions: ChangeCondition[],
        ...args: any[]
    ): Promise<EventStatusChanged[]> {
        const result = await Promise.race([this.pollEvents(conditions, ...args), delay(20000)]);
        if (result) {
            return result;
        }
        throw new Error(`event polling timeout`);
    }

    private async pollEvents(
        conditions: ChangeCondition[],
        ...args: any[]
    ): Promise<EventStatusChanged[]> {
        let events = [];
        let foundChanges;
        while (!foundChanges || foundChanges.length !== conditions.length) {
            await delay(1000);
            events = await this.getEvents(...args);
            foundChanges = this.findChanges(events, conditions);
        }
        return foundChanges;
    }

    private findChanges(events: Event[], conditions: ChangeCondition[]): EventStatusChanged[] {
        const result = [];
        for (const { changes } of events) {
            for (const condition of conditions) {
                // @ts-ignore
                const found = changes.find(change => condition(change));
                found !== undefined && result.push(found);
            }
        }
        return result;
    }

    abstract async getEvents(...args: any[]): Promise<Event[]>;
}
