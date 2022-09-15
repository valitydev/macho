import { AuthActions, PrivdocActions } from '../../actions';

describe('Store private docs', () => {
    let privdocActions: PrivdocActions;

    before(async () => {
        const externalAccessToken = await AuthActions.authExternal();
        privdocActions = new PrivdocActions(externalAccessToken);
    });

    it('should store passport', async () => {
        await privdocActions.savePassport();
    });

    it('should store RIC', async () => {
        await privdocActions.saveRIC();
    });
});
