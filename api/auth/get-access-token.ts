import * as chai from 'chai';
import { authEndpoint } from '../../settings';
import request = require('request');

chai.should();

export function getAccessToken(
    realm: string,
    login: string,
    password: string,
    clientID: string
): Promise<string> {
    return new Promise((resolve, reject) => {
        request.post(
            {
                url: `${authEndpoint}/auth/realms/${realm}/protocol/openid-connect/token`,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Host: process.env.AUTH_HOST
                },
                body: `username=${login}&password=${password}&client_id=${clientID}&grant_type=password`
            },
            (err, response, body) => {
                if (err) {
                    reject(err);
                } else {
                    response.statusCode.should.eq(200);
                    resolve(JSON.parse(body).access_token);
                }
            }
        );
    });
}
