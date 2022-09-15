import { AuthActions, ProvidersActions } from '../../actions';

describe('Providers', () => {
    let providersActions: ProvidersActions;
    let providerID: string;
    let identityClassID: string;
    let identityLevelID: string = '1';

    before(async () => {
        const externalAccessToken = await AuthActions.authExternal();
        providersActions = new ProvidersActions(externalAccessToken);
    });

    it('should get list providers', async () => {
        const providers = await providersActions.listProviders();
        providerID = providers[0].id;
    });

    it('should get provider', async () => {
        await providersActions.getProvider(providerID);
    });

    it('should get identity classes', async () => {
        const classes = await providersActions.listProviderIdentityClasses(providerID);
        identityClassID = classes[0].id;
    });

    it('should get provider', async () => {
        await providersActions.getProviderIdentityClass(providerID, identityClassID);
    });

    it('should get identity auth levels', async () => {
        await providersActions.listProviderIdentityLevels(providerID, identityClassID);
    });

    it('should get auth level', async () => {
        await providersActions.getProviderIdentityLevel(
            providerID,
            identityClassID,
            identityLevelID
        );
    });

    it('should get residence', async () => {
        await providersActions.getResidence('RUS');
    });

    it('should get currency', async () => {
        await providersActions.getCurrency('RUB');
    });
});
