import request = require('request');
import { Authentication } from './authentication';

export class ApiKeyAuth implements Authentication {
    public apiKey: string;

    constructor(private location: string, private paramName: string) {}

    applyToRequest(requestOptions: request.Options): void {
        if (this.location == 'query') {
            (<any>requestOptions.qs)[this.paramName] = this.apiKey;
        } else if (this.location == 'header' && requestOptions && requestOptions.headers) {
            requestOptions.headers[this.paramName] = this.apiKey;
        }
    }
}
