import { WithdrawalBody, WithdrawalParameters } from '../../codegen';

export function getWithdrawalParams(
    wallet: string,
    destination: string,
    body: WithdrawalBody,
    externalID?: string
): WithdrawalParameters {
    return {
        wallet,
        destination,
        body,
        externalID
    };
}
