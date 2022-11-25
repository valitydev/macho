import { AuthActions } from '../actions';
import { PartiesActions } from '../actions/capi-v2';

describe('Claims', () => {
    let partyID: string;
    let claimsActions: ClaimsActions;
    let papiClaimsActions: PapiClaimsActions;

    before(async () => {
        const [externalAccessToken, internalAccessToken] = await Promise.all([
            AuthActions.authExternal(),
            AuthActions.authInternal()
        ]);
        claimsActions = new ClaimsActions(externalAccessToken);
        papiClaimsActions = new PapiClaimsActions(internalAccessToken);
        const partiesActions = new PartiesActions(externalAccessToken);
        const party = await partiesActions.getActiveParty();
        partyID = party.id;
    });

    describe('Test shop claim', () => {
        let claimID: number;

        it('should create new claim', async () => {
            const claim = await claimsActions.createClaimForTestShop();
            claimID = claim.id;
        });

        it('should return accepted claim', async () => {
            await claimsActions.getAcceptedClaimByID(claimID);
        });
    });

    describe('Live shop claim', () => {
        let claimID: number;

        it('should create new claim', async () => {
            const claim = await claimsActions.createClaimForLiveShop();
            claimID = claim.id;
        });

        it('should return pending claim', async () => {
            await claimsActions.getPendingClaimByID(claimID);
        });

        it('should accept claim', async () => {
            await papiClaimsActions.acceptClaimByID(partyID, claimID, 1);
        });

        it('should return accepted claim', async () => {
            await claimsActions.getAcceptedClaimByID(claimID);
        });
    });
});
