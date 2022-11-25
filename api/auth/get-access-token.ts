import { authEndpoint } from '../../settings';
import axios from 'axios';

export function getAccessToken(
    realm: string,
    login: string,
    password: string,
    clientID: string
): Promise<string> {

    return axios.post(
        `${authEndpoint}/auth/realms/${realm}/protocol/openid-connect/token`,
        new URLSearchParams({
            'grant_type': 'password',
            'username': login,
            'password': password,
            'client_id': clientID
        })
    )
        .then(response => {
            return response.data['access_token'];
        });

}
