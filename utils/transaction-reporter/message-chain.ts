export class MessageChain {
    private message: string;

    constructor(init: string) {
        this.message = init;
    }

    add(label: string, timing: number): MessageChain {
        this.message = this.message.concat(timing ? ` ${label}=${timing}ms` : '');
        return this;
    }

    result(): string {
        return this.message;
    }
}
