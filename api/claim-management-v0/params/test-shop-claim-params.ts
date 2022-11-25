import guid from '../../../utils/guid';
import {
    contractCreationChange,
    contractPayoutToolCreationChange,
    contractLegalAgreementBindingChange,
    shopCreationChange,
    shopAccountCreationChange
} from './default-claim-params';
import { Modification } from '../codegen';

export function testShopClaimChangeset(id?: string): Array<Modification> {
    const testShopID = id || guid();
    const testContractID = id || guid();
    const testContractorID = id || guid();
    const testPayoutToolID = id || guid();
    return [
        contractCreationChange(testContractID, 1, testContractorID),
        contractPayoutToolCreationChange(testContractID, testPayoutToolID, 'RUB'),
        contractLegalAgreementBindingChange(testContractID),
        shopCreationChange(testShopID, testContractID, testPayoutToolID, 1),
        shopAccountCreationChange(testShopID, 'RUB')
    ];
}
