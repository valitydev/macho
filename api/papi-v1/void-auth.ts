import request = require('request');
import { Authentication } from './authentication';

export class VoidAuth implements Authentication {
    public username: string;
    public password: string;

    applyToRequest(_: request.Options): void {
        // Do nothing
    }
}
