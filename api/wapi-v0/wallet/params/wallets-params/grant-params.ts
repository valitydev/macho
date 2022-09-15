import { DestinationGrantRequest, WalletGrantRequest } from '../../codegen';
import moment = require('moment');

export function getWalletGrantParams(): WalletGrantRequest {
    return {
        asset: {
            amount: 1000,
            currency: 'RUB'
        },
        validUntil: new Date(moment.now() + 24 * 60 * 60 * 1000)
    };
}

export function getWithdrawalGrantParams(): DestinationGrantRequest {
    return {
        validUntil: new Date(moment.now() + 24 * 60 * 60 * 1000)
    };
}
