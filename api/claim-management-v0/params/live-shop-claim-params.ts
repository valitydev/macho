import guid from '../../../utils/guid';
import {
    contractorCreationChange,
    contractCreationChange,
    contractPayoutToolCreationChange,
    contractLegalAgreementBindingChange,
    shopCreationChange,
    shopAccountCreationChange,
    contractPayoutToolWalletCreationChange
} from './default-claim-params';
import { Modification } from '../codegen';

export function shopClaimChangeset(id?: string): Array<Modification> {
    const shopID = id || guid();
    const contractID = id || guid();
    const contractorID = id || guid();
    const payoutToolID = id || guid();
    return [
        contractorCreationChange(contractorID),
        contractCreationChange(contractID, 1, contractorID),
        contractPayoutToolCreationChange(contractID, payoutToolID, 'RUB'),
        contractLegalAgreementBindingChange(contractID),
        shopCreationChange(shopID, contractID, payoutToolID, 1),
        shopAccountCreationChange(shopID, 'RUB')
    ];
}

export function payoutToolClaimChangeset(contractID: string): Array<Modification> {
    return [
        contractPayoutToolCreationChange(contractID, guid(), 'RUB')
    ];
}

export function walletPayoutToolClaimChangeset(
    contractID: string,
    walletID: string
): Array<Modification> {
    return [
        contractPayoutToolWalletCreationChange(contractID, guid(), 'RUB', walletID)
    ];
}
