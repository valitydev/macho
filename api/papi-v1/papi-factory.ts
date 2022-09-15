import { ClaimsApiForTests, PapiForTests, PayoutsApiForTests } from '.';
import { adminEndpoint } from '../../settings';

const classes = {
    ClaimsApiForTests,
    PayoutsApiForTests
};

export class PapiFactory {
    public static getInstance<T extends PapiForTests>(className: string, accessToken: string): T {
        let instance = classes[className] && new classes[className]();
        if (instance) {
            instance.setApiKey(0, `Bearer ${accessToken}`);
            instance.defaultHeaders = {
                'Content-Type': 'application/json; charset=utf-8'
            };
            instance.basePath = `${adminEndpoint}/papi/v1`;
        }
        return instance;
    }
}
