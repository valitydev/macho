import * as chai from 'chai';

import { WapiPrivdocDispatcher } from '../../../utils/codegen-utils';
import { PrivateDocumentsApiFp } from '../../../api/wapi-v0/privdoc/codegen';
import {
    getPassportParams,
    getRICParams
} from '../../../api/wapi-v0/privdoc/params/privdoc-params';

chai.should();

export class PrivdocActions {
    private api;
    private dispatcher: WapiPrivdocDispatcher;

    constructor(accessToken: string) {
        this.dispatcher = new WapiPrivdocDispatcher({});
        this.api = PrivateDocumentsApiFp({
            apiKey: `Bearer ${accessToken}`
        });
    }

    async savePassport() {
        const passport = getPassportParams();
        const storedPassport = await this.dispatcher.callMethod(
            this.api.storePrivateDocument,
            passport
        );
        storedPassport.should.contain.key('token');
        return storedPassport;
    }

    async saveRIC() {
        const ric = getRICParams();
        const createdRIC = await this.dispatcher.callMethod(this.api.storePrivateDocument, ric);
        createdRIC.should.contain.key('token');
        return createdRIC;
    }
}
