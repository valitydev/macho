import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { AxiosError } from 'axios';
import { IdentitiesActions } from '../../actions/wapi-v0';
import { AuthActions } from '../../actions';
import { PayresActions } from '../../actions/wapi-v0';
import { getDestinationParams } from '../../api/wapi-v0/payres/params/payres-params';
import { WithdrawalsActions } from '../../actions/wapi-v0/wallet/withdrawals-actions';
import { WalletsActions } from '../../actions/wapi-v0/wallet';
import { getWithdrawalParams } from '../../api/wapi-v0/wallet/params/wallets-params/simple-withdrawal-params';
import {
    isWithdrawalSucceeded,
    WithdrawalsEventActions
} from '../../actions/wapi-v0/wallet/withdrawals-event-actions';
import guid from '../../utils/guid';
import until from '../../utils/until';

chai.should();
chai.use(chaiAsPromised);

describe('Withdrawals', () => {
    let identitiesActions: IdentitiesActions;
    let payresActions: PayresActions;
    let walletsActions: WalletsActions;
    let withdrawalsActions: WithdrawalsActions;
    let withdrawalEventActions: WithdrawalsEventActions;
    let identityID: string;
    let destinationID: string;
    let walletID: string;
    let withdrawalID: string;
    let externalID: string;

    before(async () => {
        const externalAccessToken = await AuthActions.authExternal();
        identitiesActions = new IdentitiesActions(externalAccessToken);
        payresActions = new PayresActions(externalAccessToken);
        walletsActions = new WalletsActions(externalAccessToken);
        withdrawalsActions = new WithdrawalsActions(externalAccessToken);
        withdrawalEventActions = new WithdrawalsEventActions(externalAccessToken);
        identityID = (await identitiesActions.createIdentity()).id;
        walletID = (await walletsActions.createNewWallet(identityID)).id;
        externalID = `external/${guid()}`;
    });

    it('should fail to create new destination', async () => {
        const storedCard = await payresActions.storeBankCard();
        const destinationParams = getDestinationParams(identityID, storedCard);
        destinationParams.name = '4242424242424242';
        const error =
            await withdrawalsActions.createDestination(destinationParams)
            .should.eventually.be.rejectedWith(AxiosError);
        error.response.status.should.be.eq(400);
        error.response.data.should.include({
            errorType: 'SchemaViolated'
        });
    });

    it('should create new destination', async () => {
        const storedCard = await payresActions.storeBankCard();
        storedCard.should.contain.keys('token', 'validUntil');
        const destinationParams = getDestinationParams(identityID, storedCard);
        const destination = await withdrawalsActions.createDestination(destinationParams);
        destination.should.have.property('id').that.is.a('string');
        destination.should.have.property('identity').equal(identityID);
        destination.should.contain.keys('name', 'currency', 'resource', 'status');
        destinationID = destination.id;
        await until(() => withdrawalsActions.getDestination(destinationID))
            .satisfy(destination => {
                if (destination.status !== 'Authorized') {
                    throw new Error(`Destination is ${destination.status}`);
                }
            })
    });

    it('should create withdrawal', async () => {
        const withdrawalParams = getWithdrawalParams(
            walletID,
            destinationID,
            {
                amount: 100,
                currency: 'RUB'
            },
            externalID
        );
        const withdrawal = await withdrawalsActions.createWithdrawal(withdrawalParams);
        withdrawalID = withdrawal.id;
        await withdrawalEventActions.waitConditions([isWithdrawalSucceeded()], withdrawalID);
    });

    it('should list withdrawals', async () => {
        const withdrawals = await withdrawalsActions.listWithdrawals(1000);
        withdrawals.should.contain.keys('result');
    });

    //it('should get list destinations', async () => {
    //    await withdrawalsActions.listDestinations(1000);
    //    destinations.should.contain.keys('result');
    //});

    it('should get destination', async () => {
        const destination = await withdrawalsActions.getDestination(destinationID);
        destination.should.have.property('id').equal(destinationID);
        destination.should.contain.keys('name', 'identity', 'currency', 'resource', 'status');
    });

    it('should get destination grant', async () => {
        const grant = await withdrawalsActions.issueDestinationGrant(destinationID);
        grant.should.contain.keys('token', 'validUntil');
    });

    it('should get withdrawal', async () => {
        const withdrawal = await withdrawalsActions.getWithdrawal(withdrawalID);
        withdrawal.should.have.property('id').equal(withdrawalID);
        withdrawal.should.have.property('wallet').equal(walletID);
        withdrawal.should.have.property('destination').equal(destinationID);
        withdrawal.should.contain.keys('body');
    });

    it('should get withdrawal by external id', async () => {
        const withdrawal = await withdrawalsActions.getWithdrawalByExternal(externalID);
        withdrawal.id.should.eq(withdrawalID);
        withdrawal.should.contain.keys('wallet', 'destination', 'body', 'externalID');
    });

    it('should get withdrawal events', async () => {
        const events = await withdrawalsActions.pollWithdrawalEvents(withdrawalID);
        events.should.have.property('length').greaterThan(0);
        events[0].should.contain.keys('eventID', 'occuredAt', 'changes');
        const event = await withdrawalsActions.getWithdrawalEvent(withdrawalID, events[0].eventID);
        event.should.have.property('id').equal(events[0].eventID);
        event.should.have.property('changes').that.is.an('array');
        event.should.contain.keys('occuredAt');
    });
});
