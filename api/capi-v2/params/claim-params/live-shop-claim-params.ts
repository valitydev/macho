import guid from '../../../../utils/guid';
import {
    contractCreationChange,
    contractPayoutToolCreationChange,
    contractLegalAgreementBindingChange,
    shopCreationChange,
    shopCategoryChange,
    shopAccountCreationChange,
    contractPayoutToolWalletCreationChange
} from './default-claim-params';
import { ClaimChangeset } from '../../codegen';

export function liveShopClaimChangeset(id?: string): ClaimChangeset {
    const liveShopID = id || guid();
    const liveContractID = id || guid();
    const livePayoutToolID = id || guid();

    return [
        contractCreationChange(liveContractID, 2),
        contractPayoutToolCreationChange(liveContractID, livePayoutToolID, 'RUB'),
        contractLegalAgreementBindingChange(liveContractID),
        shopCreationChange(liveShopID, liveContractID, livePayoutToolID),
        shopCategoryChange(liveShopID, 2),
        shopAccountCreationChange(liveShopID, 'RUB')
    ] as ClaimChangeset;
}

export function createPayoutToolClaimChangeset(liveContractID: string): ClaimChangeset {
    return [contractPayoutToolCreationChange(liveContractID, guid(), 'RUB')] as ClaimChangeset;
}

export function createWalletPayoutToolClaimChangeset(
    liveContractID: string,
    walletID: string
): ClaimChangeset {
    return [
        contractPayoutToolWalletCreationChange(liveContractID, guid(), 'RUB', walletID)
    ] as ClaimChangeset;
}
