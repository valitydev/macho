import guid from '../../../../utils/guid';
import {
    contractCreationChange,
    contractPayoutToolCreationChange,
    contractLegalAgreementBindingChange,
    shopCreationChange,
    shopCategoryChange,
    shopAccountCreationChange
} from './default-claim-params';
import { ClaimChangeset } from '../../codegen';

export function testShopClaimChangeset(id?: string): ClaimChangeset {
    const testShopID = id || guid();
    const testContractID = id || guid();
    const testPayoutToolID = id || guid();

    return [
        contractCreationChange(testContractID, 1),
        contractPayoutToolCreationChange(testContractID, testPayoutToolID, 'RUB'),
        contractLegalAgreementBindingChange(testContractID),
        shopCreationChange(testShopID, testContractID, testPayoutToolID),
        shopCategoryChange(testShopID, 1),
        shopAccountCreationChange(testShopID, 'RUB')
    ] as ClaimChangeset;
}
