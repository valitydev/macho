import { getAccessToken } from '../api';
import { externalLogin, externalPassword, internalLogin, internalPassword } from '../settings';

export class AuthActions {
    private externalAccessToken: string | undefined = undefined;
    private internalAccessToken: string | undefined = undefined;

    private static instance: AuthActions;

    getExternalAccessToken(): Promise<string> {
        return this.externalAccessToken
            ? Promise.resolve(this.externalAccessToken)
            : this.createExternalAccessToken();
    }

    getInternalAccessToken(): Promise<string> {
        return this.internalAccessToken
            ? Promise.resolve(this.internalAccessToken)
            : this.createInternalAccessToken();
    }

    private createExternalAccessToken(): Promise<string> {
        return AuthActions.authExternal().then(externalAccessToken => {
            this.externalAccessToken = externalAccessToken;
            return externalAccessToken;
        });
    }

    private createInternalAccessToken(): Promise<string> {
        return AuthActions.authInternal().then(internalAccessToken => {
            this.internalAccessToken = internalAccessToken;
            return internalAccessToken;
        });
    }

    static authExternal(clientID?: string): Promise<string> {
        return getAccessToken(
            'external',
            externalLogin,
            externalPassword,
            clientID ? clientID : 'common-api'
        );
    }

    static authInternal(clientID?: string): Promise<string> {
        return getAccessToken(
            'internal',
            internalLogin,
            internalPassword,
            clientID ? clientID : 'private-api'
        );
    }

    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new AuthActions();
        return this.instance;
    }
}
