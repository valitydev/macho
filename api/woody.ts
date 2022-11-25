import { spawnSync } from 'child_process';
import { verbose } from '../settings';

export class WoodyException extends Error {

    name: "WoodyException";
    public ty: string;
    public content: Object;

    constructor(ty: string, content: Object) {
        super(`${ty}${JSON.stringify(content)}`);
        this.ty = ty;
        this.content = content;
    }

}

export class WoodyError extends Error {
    name: "WoodyError";
    constructor(message: string) {
        super(message);
    }
}

interface Options {
    deadline?: number | Date;
    user?: UserIdentity;
};

interface UserIdentity {
    id: string;
    realm: string;
    name?: string;
    email?: string;
}

export class Service {

    public name: string;
    public schema: string;
    public url: string;

    constructor(name: string, schema: string, url: string) {
        this.name = name;
        this.schema = schema;
        this.url = url;
    }

    asWoorlArgs(): Array<string> {
        return ['-s', this.schema, this.url, this.name];
    }

}

export class RPC {

    private service: Service;
    private fn: string;
    private timeout: number;
    private opts: Array<string>;

    constructor(service: Service, fn: string, options?: Options) {

        this.service = service;
        this.fn = fn;
        this.opts = [];

        if (typeof(options.deadline) === 'number') {
            this.opts.push('--deadline', `${options.deadline}ms`);
        }
        if (typeof(options.deadline) === 'object') {
            this.opts.push('--deadline', options.deadline.toISOString());
        }

        if (typeof(options.user) === 'object') {
            this.opts.push('--user-id', options.user.id);
            this.opts.push('--user-realm', options.user.realm);
            options.user.name && this.opts.push('--user-name', options.user.name);
            options.user.email && this.opts.push('--user-email', options.user.email);
        }

    }

    issue(...args: any[]): Promise<any> {
        const cmd = 'woorl';
        const cmdArgs = [
            '-v',
            ...this.opts,
            ...this.service.asWoorlArgs(),
            this.fn, ...args.map((arg) => JSON.stringify(arg))
        ];
        const process = spawnSync(cmd, cmdArgs, {
            stdio: ['ignore', 'pipe', 'pipe'],
            encoding: 'utf-8',
            timeout: 15000 // TODO
        });
        if (process.error) {
            return Promise.reject(process.error);
        }
        if (verbose) {
            console.log(` >>> `);
            console.log(` >>> ${cmd} ${cmdArgs.join(' ')}`);
            console.log(` >>> `);
            console.log(` < exit status: ${process.status}`);
            if (process.stdout) {
                console.log(` < stdout:`);
                console.log(process.stdout);
            }
            if (process.stderr) {
                console.log(` < stderr:`);
                console.log(process.stderr);
            }
        }
        if (process.status === 0) {
            const response = process.stdout.trim();
            if (response.length > 0) {
                return Promise.resolve(JSON.parse(response));
            }
            else {
                return Promise.resolve();
            }
        }
        if (process.status === 1) {
            const response = process.stdout.trim();
            const exception = JSON.parse(response);
            const data = Array.isArray(exception.data) ? {} : exception.data;
            return Promise.reject(new WoodyException(exception.exception, data));
        }
        return Promise.reject(new WoodyError(process.stderr.trim()));
    }

}
