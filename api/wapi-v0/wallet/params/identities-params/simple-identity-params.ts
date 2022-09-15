import { Identity } from '../../codegen';

export function getSimpleIdentityParams(
    name: string = 'Test Name',
    provider: string = 'test',
    _class: string = 'person'
): Identity {
    return {
        name,
        provider,
        class: _class
    } as any;
}
