import { WarnTimingConfig } from './warn-timing-config';
import { Levels } from './levels';
import { Statuses } from './statuses';
import { MessageChain } from './message-chain';

export class TransactionReporter {
    private authTime: number;
    private createInvoiceTime: number;
    private createPaymentResourceTime: number;
    private createPaymentTime: number;
    private pollingTime: number;
    private fulfillInvoiceTime: number;
    private cfg: WarnTimingConfig;

    constructor(config: WarnTimingConfig) {
        this.cfg = config;
    }

    setAuthTime(time: number) {
        this.authTime = time;
    }

    setCreateInvoiceTime(time: number) {
        this.createInvoiceTime = time;
    }

    setCreatePaymentResourceTime(time: number) {
        this.createPaymentResourceTime = time;
    }

    setPaymentTime(time: number) {
        this.createPaymentTime = time;
    }

    setPollingTime(time: number) {
        this.pollingTime = time;
    }

    setFulfillInvoiceTime(time: number) {
        this.fulfillInvoiceTime = time;
    }

    hasTimeWarn(): boolean {
        return (
            this.cfg.auth < this.authTime ||
            this.cfg.createInvoice < this.createInvoiceTime ||
            this.cfg.createPaymentResource < this.createPaymentResourceTime ||
            this.cfg.createPayment < this.createPaymentTime ||
            this.cfg.polling < this.pollingTime ||
            this.cfg.fulfillInvoice < this.fulfillInvoiceTime
        );
    }

    report(status: string) {
        const level = this.getLevel(status, this.hasTimeWarn());
        console.log(
            this.prepareMessage(level, status)
                .add('auth', this.authTime)
                .add('createInvoice', this.createInvoiceTime)
                .add('createPaymentResource', this.createPaymentResourceTime)
                .add('createPayment', this.createPaymentTime)
                .add('pollingPaymentEvents', this.pollingTime)
                .add('fulfillInvoice', this.fulfillInvoiceTime)
                .result()
        );
    }

    private prepareMessage(level: string, status: string): MessageChain {
        return new MessageChain(`\n${level}: Transaction ${status} |`);
    }

    private getLevel(status, hasTimeWarn): Levels {
        let level = Levels.ok;
        if (status === Statuses.failed) {
            level = Levels.critical;
        } else if (hasTimeWarn) {
            level = Levels.warning;
        }
        return level;
    }
}
