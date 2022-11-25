// Type definitions for chai-date-string

/// <reference types="chai" />

declare function chaiDateString(chai: any, utils: any): void;
export = chaiDateString;

declare global {
    namespace Chai {
        interface Assertion {
            dateString(val: string): Assertion;
        }
    }
}
