import { IdentitiesActions } from '../../actions/wapi-v0';
import { AuthActions } from '../../actions';

describe('Identities', () => {
    let identitiesActions: IdentitiesActions;

    before(async () => {
        const externalAccessToken = await AuthActions.authExternal();
        identitiesActions = new IdentitiesActions(externalAccessToken);
    });

    it('should create new identity', async () => {
        await identitiesActions.createIdentity();
    });

    it('should get identity', async () => {
        const identityID = (await identitiesActions.createIdentity()).id;
        await identitiesActions.getIdentity(identityID);
    });

    it('should get list identities', async () => {
        await identitiesActions.listIdentities(1000);
    });

    // describe('Identity challenge', () => {
    //     let identityID: string;
    //     let challengeID: string;
    //     let eventID: string;

    //     it('should pass identity challenge', async () => {
    //         const identity = await identitiesActions.createIdentity();
    //         identityID = identity.id;
    //         const storedPassport = await privdocActions.savePassport();
    //         const storedRIC = await privdocActions.saveRIC();
    //         const challenge = getIdentityChallengeParams([
    //             { token: storedPassport.token },
    //             { token: storedRIC.token }
    //         ]);
    //         const startedChallenge = await identitiesActions.startIdentityChallenge(
    //             identity.id,
    //             challenge
    //         );
    //         challengeID = startedChallenge.id;
    //         await identitiesEventActions.waitConditions(
    //             [isIdentityChallengeCompleted()],
    //             identity.id,
    //             startedChallenge.id
    //         );
    //     });

    //     it('should get identity challenge', async () => {
    //         await identitiesActions.getIdentityChallenge(identityID, challengeID);
    //     });

    //     it('should get list identity challenges', async () => {
    //         await identitiesActions.listIdentityChallenges(identityID);
    //     });

    //     it('should poll identity challenge events', async () => {
    //         const events = await identitiesActions.pollIdentityChallengeEvents(
    //             identityID,
    //             challengeID
    //         );
    //         eventID = events[0].eventID;
    //     });

    //     it('should get identity challenge event', async () => {
    //         await identitiesActions.getIdentityChallengeEvent(identityID, challengeID, eventID);
    //     });
    // });
});
