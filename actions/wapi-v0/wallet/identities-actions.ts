import * as chai from 'chai';
import { IdentitiesApiFp, IdentityChallenge } from '../../../api/wapi-v0/wallet/codegen';
import { getSimpleIdentityParams } from '../../../api/wapi-v0/wallet/params/identities-params/simple-identity-params';
import { WAPIDispatcher } from '../../../utils/codegen-utils';

chai.should();

export class IdentitiesActions {
    private api;
    private dispatcher: WAPIDispatcher;

    constructor(accessToken: string) {
        this.dispatcher = new WAPIDispatcher({});
        this.api = IdentitiesApiFp({
            apiKey: `Bearer ${accessToken}`
        });
    }

    async createIdentity() {
        const simpleIdentity = getSimpleIdentityParams();
        const createdIdentity = await this.dispatcher.callMethod(
            this.api.createIdentity,
            simpleIdentity,
            undefined
        );
        createdIdentity.should.contain.keys('class', 'name', 'provider');
        return createdIdentity;
    }

    async getIdentity(identityID: string) {
        const identity = await this.dispatcher.callMethod(
            this.api.getIdentity,
            identityID,
            undefined
        );
        identity.should.contain.keys('name', 'provider', 'class');
        return identity;
    }

    async listIdentityChallenges(identityID: string) {
        const challenges = await this.dispatcher.callMethod(
            this.api.listIdentityChallenges,
            identityID,
            undefined,
            undefined
        );
        challenges.should.be.a('array');
        return challenges;
    }

    async startIdentityChallenge(identityID: string, challenge: IdentityChallenge) {
        return await this.dispatcher.callMethod(
            this.api.startIdentityChallenge,
            identityID,
            challenge,
            undefined
        );
    }

    async getIdentityChallenge(identityID: string, challengeID: string) {
        const identityChallenge = await this.dispatcher.callMethod(
            this.api.getIdentityChallenge,
            identityID,
            challengeID,
            undefined
        );
        identityChallenge.should.contain.keys('type', 'proofs');
        return identityChallenge;
    }

    async listIdentities(
        limit: number,
        providerID?: string,
        classID?: string,
        levelID?: string,
        continuationToken?: string
    ) {
        const identities = await this.dispatcher.callMethod(
            this.api.listIdentities,
            limit,
            providerID,
            classID,
            levelID,
            continuationToken,
            undefined
        );
        identities.should.contain.keys('result');
        return identities;
    }

    async pollIdentityChallengeEvents(identityID: string, challengeID: string) {
        const events = await this.dispatcher.callMethod(
            this.api.pollIdentityChallengeEvents,
            identityID,
            challengeID,
            1000,
            undefined,
            undefined
        );
        events.should.property('length').not.equal(0);
        events[0].should.contain.keys('eventID', 'occuredAt', 'changes');
        return events;
    }

    async getIdentityChallengeEvent(identityID: string, challengeID: string, eventID: string) {
        const event = await this.dispatcher.callMethod(
            this.api.getIdentityChallengeEvent,
            identityID,
            challengeID,
            eventID,
            undefined
        );
        event.should.contain.keys('changes', 'eventID', 'occuredAt');
        return event;
    }
}
