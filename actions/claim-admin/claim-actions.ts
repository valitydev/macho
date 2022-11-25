import * as woody from '../../api/woody';
import {
    claimAdminEndpoint,
    internalLogin
} from '../../settings';

const claimManagement = new woody.Service(
    'ClaimManagement',
    'schemas/damsel/proto/claim_management.thrift',
    claimAdminEndpoint
);

export class AdminActions {
    
    acceptClaim(partyID: string, claimID: number, revision: number = 2): Promise<void> {
        let rpc = new woody.RPC(claimManagement, 'AcceptClaim', {user: {
            id: internalLogin,
            realm: 'internal',
            name: internalLogin,
            email: internalLogin
        }});
        return rpc.issue(partyID, claimID, revision);
    }

}
