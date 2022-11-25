import { AuthActions } from '../actions';
import { PartiesActions, ShopsActions } from '../actions/capi-v2';
import { ClaimsActions } from '../actions/claim-management-v1';
import { AdminActions } from '../actions/claim-admin';
import { Shop } from '../api/capi-v2/codegen';
import guid from '../utils/guid';
import until from '../utils/until';

export class ShopConditions {
    private static instance: ShopConditions;
    private partiesActions: PartiesActions;
    private shopsActions: ShopsActions;
    private claimsActions: ClaimsActions;
    private adminActions: AdminActions;

    static async getInstance(): Promise<ShopConditions> {
        if (this.instance) {
            return this.instance;
        }
        const authActions = AuthActions.getInstance();
        const exToken = await authActions.getExternalAccessToken();
        this.instance = new ShopConditions(exToken);
        return this.instance;
    }

    constructor(externalToken: string, internalToken?: string) {
        this.partiesActions = new PartiesActions(externalToken);
        this.shopsActions = new ShopsActions(externalToken);
        this.claimsActions = new ClaimsActions(externalToken);
        this.adminActions = new AdminActions();
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
        const claim = await this.claimsActions.createShopClaim(party.id, shopID);
        await until(() => this.claimsActions.getClaim(party.id, claim.id))
            .satisfy(claim => {
                if (claim.status !== 'accepted') {
                    throw new Error(`Claim ${claim.id} status is ${claim.status}`);
                }
            });
        await this.adminActions.acceptClaim(party.id, claim.id);
        return await this.shopsActions.getShopByID(shopID);
    }

    async createShopWithPayoutSchedule(scheduleID = 1): Promise<Shop> {
        const shop = await this.createShop();
        // const claim = await this.claimsActions.createClaimForLiveShopWithSchedule(
        //     shop.id,
        //     scheduleID
        // );
        const party = await this.partiesActions.getActiveParty();
        // await this.papiClaimsActions.acceptClaimByID(party.id, claim.id, 1);
        return shop;
    }

    async turnOffPayoutSchedule(shopID: string) {
        // const claim = await this.claimsActions.createClaimForLiveShopWithSchedule(shopID);
        const party = await this.partiesActions.getActiveParty();
        // await this.papiClaimsActions.acceptClaimByID(party.id, claim.id, 1);
    }
}
