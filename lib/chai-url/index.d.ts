// Type definitions for chai-url

/// <reference types="chai" />

declare function chaiUrl(chai: any, utils: any): void;
export = chaiUrl;

declare global {
    namespace Chai {
        interface Assertion {
            path(path: string): Assertion;
            pathname(pathname: string): Assertion;
            port(port: string): Assertion;
            hostname(hostname: string): Assertion;
            protocol(protocol: string): Assertion;
            auth(auth: string): Assertion;
            hash(hash: string): Assertion;
        }

        interface Assert {
            path(val: string, exp: string, msg?: string): void;
            pathname(val: string, exp: string, msg?: string): void;
            port(val: string, exp: string, msg?: string): void;
            hostname(val: string, exp: string, msg?: string): void;
            protocol(val: string, exp: string, msg?: string): void;
            auth(val: string, exp: string, msg?: string): void;
            hash(val: string, exp: string, msg?: string): void;
        }
    }
}
