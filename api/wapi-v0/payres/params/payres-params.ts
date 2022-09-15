import { BankCard } from '../codegen';
import {
    BankCardDestinationResource,
    Destination,
    DestinationResource
} from '../../wallet/codegen';
import BankCardType = BankCard.TypeEnum;

import DestinationResourceType = DestinationResource.TypeEnum;

export function getBankCardParams(): BankCard {
    return {
        type: BankCardType.BankCard,
        cardNumber: '4242424242424242',
        expDate: '12/21',
        cardHolder: 'LEXA SVOTIN',
        cvv: '123'
    };
}

export function getDestinationParams(
    identity: string,
    destinationResource: BankCardDestinationResource
): Destination {
    const resource = {
        type: DestinationResourceType.BankCardDestinationResource,
        token: destinationResource.token
    };
    return {
        name: 'Test destination',
        identity,
        currency: 'RUB',
        resource
    };
}
