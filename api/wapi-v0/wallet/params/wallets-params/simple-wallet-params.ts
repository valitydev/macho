import { Wallet } from '../../codegen';

export function getSimpleWalletParams(identity: string, name: string, currency: string): Wallet {
    return {
        name,
        identity,
        currency
    };
}
