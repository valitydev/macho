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
        externalID = 'external_id';
    });

    it('should fail to create new destination', async () => {
        const storedCard = await payresActions.storeBankCard();
        const destinationParams = getDestinationParams(identityID, storedCard);
        destinationParams.name = '4242424242424242';
        const error = await withdrawalsActions.createDestinationError(destinationParams);
        error.message.should.to.include({
            errorType: 'SchemaViolated'
        });
    });

    it('should create new destination', async () => {
        const storedCard = await payresActions.storeBankCard();
        const destinationParams = getDestinationParams(identityID, storedCard);
        const destination = await withdrawalsActions.createDestination(destinationParams);
        destinationID = destination.id;
        await withdrawalsActions.waitDestinationCreate(destinationID);
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

    it('should get list withdrawals', async () => {
        await withdrawalsActions.listWithdrawals(1000);
    });

    //it('should get list destinations', async () => {
    //    await withdrawalsActions.listDestinations(1000);
    //});

    it('should get destination', async () => {
        await withdrawalsActions.getDestination(destinationID);
    });

    it('should get destination grant', async () => {
        await withdrawalsActions.issueDestinationGrant(destinationID);
    });

    it('should get withdrawal', async () => {
        await withdrawalsActions.getWithdrawal(withdrawalID);
    });

    it('should get withdrawal by external id', async () => {
        const withdrawal = await withdrawalsActions.getWithdrawalByExternal(externalID);
        withdrawal.id.should.eq(withdrawalID);
    });

    it('should get withdrawal events', async () => {
        const events = await withdrawalsActions.pollWithdrawalEvents(withdrawalID);
        await withdrawalsActions.getWithdrawalEvents(withdrawalID, events[0].eventID);
    });
});
