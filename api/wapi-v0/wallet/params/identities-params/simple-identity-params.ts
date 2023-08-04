import { Identity } from '../../codegen';

export function getSimpleIdentityParams(
    partyID: string,
    name: string = 'Test Name',
    provider: string = 'test',
    _class: string = 'person'
): Identity {
    return {
        partyID: partyID,
        name,
        provider,
        class: _class
    } as any;
}
