import * as chai from 'chai';
import { Shop, ShopsApiFp } from '../../api/capi-v2/codegen';
import { CAPIDispatcher } from '../../utils/codegen-utils';

chai.should();

export class ShopsActions {
    private api;
    private dispatcher: CAPIDispatcher;

    constructor(accessToken: string) {
        this.dispatcher = new CAPIDispatcher({});
        this.api = ShopsApiFp({
            apiKey: `Bearer ${accessToken}`
        });
    }

    getFirstShop(): Promise<Shop> {
        return this.dispatcher.callMethod(this.api.getShops).then(shops => {
            shops.should.to.be.an('array').that.is.not.empty;
            const shop = shops[0];
            shop.should.to.deep.include({
                isBlocked: false,
                isSuspended: false
            });
            return shop;
        });
    }

    getShopByID(shopID: string): Promise<Shop> {
        return this.dispatcher.callMethod(this.api.getShopByID, shopID).then(shop => {
            shop.should.to.have.property('id').to.be.a('string');
            return shop;
        });
    }
}
