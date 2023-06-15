import * as chai from 'chai';
import { Shop, ShopsApiFp } from '../../api/capi-v2/codegen';
import { CAPIDispatcher } from '../../utils/codegen-utils';

chai.should();

export class ShopsActions {
    private api;
    private dispatcher: CAPIDispatcher;

    constructor(accessToken: string) {
        this.dispatcher = new CAPIDispatcher({
            headers: {
                origin: 'https://dashboard.stage.empayre.com'
            }
        });
        this.api = ShopsApiFp({
            apiKey: `Bearer ${accessToken}`
        });
    }

    getFirstShop(partyID: string): Promise<Shop> {
        return this.dispatcher.callMethod(this.api.getShopsForParty, partyID).then(shops => {
            shops.should.to.be.an('array').that.is.not.empty;
            const shop = shops[0];
            shop.should.to.deep.include({
                isBlocked: false,
                isSuspended: false
            });
            return shop;
        });
    }

    getShopByID(shopID: string, partyID: string): Promise<Shop> {
        return this.dispatcher.callMethod(this.api.getShopByIDForParty, shopID, partyID).then(
            function (shop) {
                shop.should.to.have.property('id').to.be.a('string');
                return shop;
            },
            function (_) {
                return null;
            }
        );
    }
}
