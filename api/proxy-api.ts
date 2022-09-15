import guid from '../utils/guid';
import * as request from 'request';
import { proxyEndpoint } from '../settings';

export class ProxyApiForTests {
    constructor(private accessToken: string) {}

    public payTerminalPayment(spid: string, amount: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const params = this.defaultParams(spid, amount);
            request.get(params, (err, response) =>
                response.body.indexOf('ERR_CD=0') !== -1 ? resolve() : reject('ERR_CD !== 0')
            );
        });
    }

    private defaultParams(spid: string, amount: number) {
        return {
            url: `${proxyEndpoint}/agent/api/payment?VERSION=2.01&DSTACNT_NR=${spid}&ACT_CD=1&TR_AMT=${amount /
                100}.00&CUR_CD=643&TR_NR=123`,
            json: true,
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                Authorization: `Bearer ${this.accessToken}`,
                'X-Request-ID': guid()
            }
        };
    }
}
