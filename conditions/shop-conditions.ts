import { ClaimsActions, PartiesActions, ShopsActions } from '../actions/capi-v2';
import { Shop } from '../api/capi-v2/codegen';
import guid from '../utils/guid';
import { PapiClaimsActions } from '../actions/papi-v1';
import { AuthActions } from '../actions';

export class ShopConditions {
    private static instance: ShopConditions;
    private claimsActions: ClaimsActions;
    private partiesActions: PartiesActions;
    private shopsActions: ShopsActions;
    private papiClaimsActions: PapiClaimsActions;

    static async getInstance(): Promise<ShopConditions> {
        if (this.instance) {
            return this.instance;
        }
        const authActions = AuthActions.getInstance();
        const exToken = await authActions.getExternalAccessToken();
        const inToken = await authActions.getInternalAccessToken();
        this.instance = new ShopConditions(exToken, inToken);
        return this.instance;
    }

    constructor(externalToken: string, internalToken: string) {
        this.claimsActions = new ClaimsActions(externalToken);
        this.partiesActions = new PartiesActions(externalToken);
        this.shopsActions = new ShopsActions(externalToken);
        this.papiClaimsActions = new PapiClaimsActions(internalToken);
    }

    async createShops(count: number): Promise<Shop[]> {
        const container = [];
        for (let i = 0; i < count; i++) {
            container.push(this.createShop());
        }
        return await Promise.all(container);
    }

    async createShop(): Promise<Shop> {
        const party = await this.partiesActions.getActiveParty();
        const shopID = guid();
        const claim = await this.claimsActions.createClaimForLiveShop(shopID);
        await this.papiClaimsActions.acceptClaimByID(party.id, claim.id, 1);
        return await this.shopsActions.getShopByID(shopID);
    }

    async createShopWithPayoutSchedule(scheduleID = 1): Promise<Shop> {
        const shop = await this.createShop();
        const claim = await this.claimsActions.createClaimForLiveShopWithSchedule(
            shop.id,
            scheduleID
        );
        const party = await this.partiesActions.getActiveParty();
        await this.papiClaimsActions.acceptClaimByID(party.id, claim.id, 1);
        return shop;
    }

    async turnOffPayoutSchedule(shopID: string) {
        const claim = await this.claimsActions.createClaimForLiveShopWithSchedule(shopID);
        const party = await this.partiesActions.getActiveParty();
        await this.papiClaimsActions.acceptClaimByID(party.id, claim.id, 1);
    }
}
