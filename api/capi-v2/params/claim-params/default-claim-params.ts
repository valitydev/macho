import * as moment from 'moment';
import {
    PartyModification,
    ContractModification,
    ContractCreation,
    Contractor,
    LegalEntity,
    BankAccount,
    ContractPayoutToolCreation,
    PayoutToolDetails,
    PayoutToolDetailsBankAccount,
    ContractLegalAgreementBinding,
    LegalAgreement,
    ShopModification,
    ShopCreation,
    ShopCategoryChange,
    ShopPayoutScheduleChange,
    ShopAccountCreation,
    ShopLocationUrl,
    ShopDetails,
    PayoutToolDetailsWalletInfo
} from '../../codegen';

import PartyModificationType = PartyModification.PartyModificationTypeEnum;
import ContractModificationType = ContractModification.ContractModificationTypeEnum;
import ShopModificationType = ShopModification.ShopModificationTypeEnum;

/* Contract changes and defaults */

export const defaultContractor = {
    contractorType: Contractor.ContractorTypeEnum.LegalEntity,
    entityType: LegalEntity.EntityTypeEnum.RussianLegalEntity,
    registeredName: 'ООО Иванов Иван Иванович',
    registeredNumber: '1117800008336',
    inn: '7840290139',
    actualAddress:
        '191040, г Санкт-Петербург, Центральный р-н, Лиговский пр-кт, д 87 стр а, оф 15Н',
    postAddress: '191040, г Санкт-Петербург, Центральный р-н, Лиговский пр-кт, д 87 стр а, оф 509',
    representativePosition: 'Директор',
    representativeFullName: 'Кочетков Игорь Викторович',
    representativeDocument:
        'паспорт 4012688115, 28.02.2013, ТП №71 отдела УФМС России по Санкт-Петербургу и Ленинградской обл. в Пушкинском р-не гор. Санкт-Петербурга',
    bankAccount: {
        account: '40703810432060000034',
        bankName: 'ФИЛИАЛ "САНКТ-ПЕТЕРБУРГСКИЙ" АО "АЛЬФА-БАНК"',
        bankPostAccount: '30101810600000000786',
        bankBik: '044030786'
    } as BankAccount
} as Contractor;

export function contractCreationChange(
    contractID: string,
    paymentInstitutionID: number,
    contractor?: Contractor
): ContractCreation {
    return {
        partyModificationType: PartyModificationType.ContractModification,
        contractID: contractID,
        contractModificationType: ContractModificationType.ContractCreation,
        paymentInstitutionID: paymentInstitutionID,
        contractor: contractor || defaultContractor
    } as ContractCreation;
}

export const defaultPayoutToolDetails = {
    detailsType: 'PayoutToolDetailsBankAccount',
    account: '40703810432060000034',
    bankName: 'ФИЛИАЛ "САНКТ-ПЕТЕРБУРГСКИЙ" АО "АЛЬФА-БАНК"',
    bankPostAccount: '30101810600000000786',
    bankBik: '044030786'
} as PayoutToolDetailsBankAccount;

export function contractPayoutToolCreationChange(
    contractID: string,
    payoutToolID: string,
    currency: string,
    details?: PayoutToolDetails
): ContractPayoutToolCreation {
    return {
        partyModificationType: PartyModificationType.ContractModification,
        contractID: contractID,
        contractModificationType: ContractModificationType.ContractPayoutToolCreation,
        payoutToolID: payoutToolID,
        currency: currency,
        details: details || defaultPayoutToolDetails
    } as ContractPayoutToolCreation;
}

export function getDefaultWalletInfo(walletID?: string): PayoutToolDetailsWalletInfo {
    return {
        detailsType: 'PayoutToolDetailsWalletInfo',
        walletID: walletID || '1'
    };
}

export function contractPayoutToolWalletCreationChange(
    contractID: string,
    payoutToolID: string,
    currency: string,
    walletID?: string
): ContractPayoutToolCreation {
    return {
        partyModificationType: PartyModificationType.ContractModification,
        contractID: contractID,
        contractModificationType: ContractModificationType.ContractPayoutToolCreation,
        payoutToolID: payoutToolID,
        currency: currency,
        details: getDefaultWalletInfo(walletID)
    } as ContractPayoutToolCreation;
}

export const defaultLegalAgreement = {
    id: '006815/07',
    signedAt: moment()
        .subtract(1, 'days')
        .utc()
        .format() as any
} as LegalAgreement;

export function contractLegalAgreementBindingChange(
    contractID: string,
    legalAgreement?: LegalAgreement
): ContractLegalAgreementBinding {
    return {
        partyModificationType: PartyModificationType.ContractModification,
        contractID: contractID,
        contractModificationType: ContractModificationType.ContractLegalAgreementBinding,
        legalAgreement: legalAgreement || defaultLegalAgreement
    } as ContractLegalAgreementBinding;
}

/* Shop changes and defaults */

export function shopCreationChange(
    shopID: string,
    contractID: string,
    payoutToolID: string
): ShopCreation {
    return {
        partyModificationType: PartyModificationType.ShopModification,
        shopID: shopID,
        shopModificationType: ShopModificationType.ShopCreation,
        location: {
            locationType: 'ShopLocationUrl',
            url: 'http://test.url'
        } as ShopLocationUrl,
        details: {
            name: 'Test shop',
            description: 'Shop for test integration'
        } as ShopDetails,
        contractID: contractID,
        payoutToolID: payoutToolID
    } as ShopCreation;
}

export function shopCategoryChange(shopID: string, categoryID: number): ShopCategoryChange {
    return {
        partyModificationType: PartyModificationType.ShopModification,
        shopID: shopID,
        shopModificationType: ShopModificationType.ShopCategoryChange,
        categoryID: categoryID
    } as ShopCategoryChange;
}

export function shopAccountCreationChange(shopID: string, currency: string): ShopAccountCreation {
    return {
        partyModificationType: PartyModificationType.ShopModification,
        shopID: shopID,
        shopModificationType: ShopModificationType.ShopAccountCreation,
        currency: currency
    } as ShopAccountCreation;
}

export function shopPayoutScheduleChange(
    shopID: string,
    scheduleID: number | undefined
): ShopPayoutScheduleChange {
    return {
        partyModificationType: PartyModificationType.ShopModification,
        shopModificationType: ShopModificationType.ShopPayoutScheduleChange,
        shopID,
        scheduleID
    };
}
