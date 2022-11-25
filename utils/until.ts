import delay from './delay';

interface RetryOptions {
    attemtps?: number;
    initialDelay?: number;
    backoff?: number;
}

export class Retry {

    private attempts: number;
    private nextDelay: number;
    private backoff: number;
    private lastError: Error;

    constructor(options?: RetryOptions) {
        this.attempts = options?.attemtps || 5;
        this.nextDelay = options?.initialDelay || 100;
        this.backoff = options?.backoff || 2.0;
    }

    withError(error: Error): Retry {
        this.lastError = error;
        return this;
    }

    async delay(): Promise<Retry> {
        await delay(this.nextDelay);
        this.attempts -= 1;
        this.nextDelay *= this.backoff;
        if (this.attempts === 0) {
            throw this.lastError;
        }
        return this;
    }

}

export class Until<T> {

    private fn: () => PromiseLike<T>;
    private currentRetry: Retry;

    constructor(fn: () => PromiseLike<T>) {
        this.fn = fn;
        this.currentRetry = new Retry();
    }

    retry(options: RetryOptions) {
        this.currentRetry = new Retry(options);
    }

    async satisfy(satisfies: (T) => void): Promise<T> {
        const result = await this.fn();
        try {
            satisfies(result);
            return result;
        }
        catch (error) {
            return this.currentRetry
                .withError(error)
                .delay()
                .then(() => {
                    return this.satisfy(satisfies);
                });
        }
    }

}

export default function until<T>(fn: () => PromiseLike<T>): Until<T> {
    return new Until(fn);
}
