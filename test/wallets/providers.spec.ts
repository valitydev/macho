import { AuthActions, ProvidersActions } from '../../actions';

describe('Providers', () => {
    let providersActions: ProvidersActions;
    let providerID: string;

    before(async () => {
        const externalAccessToken = await AuthActions.authExternal();
        providersActions = new ProvidersActions(externalAccessToken);
    });

    it('should get list providers', async () => {
        const providers = await providersActions.listProviders();
        providers.should.have.property('length').not.equal(0);
        providers[0].should.contain.keys('id', 'name', 'residences');
        providerID = providers[0].id;
    });

    it('should get provider', async () => {
        const provider = await providersActions.getProvider(providerID);
        provider.should.have.property('id').equal(providerID);
        provider.should.contain.keys('name', 'residences');
    });

    it('should get residence', async () => {
        const residence = await providersActions.getResidence('RUS');
        residence.should.have.property('id').equal('RUS');
        residence.should.contain.keys('name');
    });
    
    it('should get currency', async () => {
        const currency = await providersActions.getCurrency('RUB');
        currency.should.have.property('id').equal('RUB');
        currency.should.have.property('exponent').equal(2);
        currency.should.contain.keys('name', 'numericCode');
    });
});
