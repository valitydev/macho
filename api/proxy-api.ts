import axios, { ResponseType } from 'axios';
import guid from '../utils/guid';
import { proxyEndpoint } from '../settings';

export class ProxyApiForTests {
    constructor(private accessToken: string) {}

    public payTerminalPayment(spid: string, amount: number): Promise<void> {
        return axios.request(this.defaultParams(spid, amount))
            .then(response => {
                if (response.data.indexOf('ERR_CD=0') === -1) {
                    throw new Error('ERR_CD !== 0');
                }
            });
    }

    private defaultParams(spid: string, amount: number) {
        return {
            url: `${proxyEndpoint}/agent/api/payment?VERSION=2.01&DSTACNT_NR=${spid}&ACT_CD=1&TR_AMT=${amount /
                100}.00&CUR_CD=643&TR_NR=123`,
            responseType: 'json' as ResponseType,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Bearer ${this.accessToken}`,
                'X-Request-ID': guid()
            }
        };
    }
}
