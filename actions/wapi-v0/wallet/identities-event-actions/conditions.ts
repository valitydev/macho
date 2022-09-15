import {
    IdentityChallengeStatus,
    IdentityChallengeStatusChanged
} from '../../../../api/wapi-v0/wallet/codegen';

import IdentityChallengeStatusType = IdentityChallengeStatus.StatusEnum;

export type ChangeIdentityCondition = (change: IdentityChallengeStatusChanged) => boolean;

export function isIdentityChallengeCompleted(): ChangeIdentityCondition {
    return (change: IdentityChallengeStatusChanged) =>
        change.status === IdentityChallengeStatusType.Completed;
}
