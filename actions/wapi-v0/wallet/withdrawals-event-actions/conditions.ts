import { WithdrawalStatus } from '../../../../api/wapi-v0/wallet/codegen';

import WithdrawalStatusType = WithdrawalStatus.StatusEnum;

export type ChangeWithdrawalCondition = (change: WithdrawalStatus) => boolean;

// TODO: fix failed withdrawal
export function isWithdrawalSucceeded(): ChangeWithdrawalCondition {
    return (change: WithdrawalStatus) => change.status === WithdrawalStatusType.Succeeded;
}
