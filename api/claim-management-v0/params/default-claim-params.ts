import moment from 'moment';
import {
    Modification,
    PartyModification,
    PartyModificationType,
    ContractModification,
    ContractCreationModification,
    ContractorType,
    LegalEntity,
    LegalEntityType,
    RussianBankAccount,
    ContractPayoutToolModification,
    ContractPayoutToolCreationModification,
    ContractLegalAgreementBindingModification,
    PayoutToolInfo,
    LegalAgreement,
    ShopModification,
    ShopModificationUnit,
    ShopCreationModification,
    ShopPayoutScheduleModification,
    ShopAccountCreationModification,
    ShopLocation,
    ShopLocationUrl,
    ShopDetails,
    CategoryRef,
    BusinessScheduleRef,
    CurrencyRef,
    ContractModificationUnit,
    WalletInfo,
    ContractorModification,
    ContractorModificationUnit,
    Contractor
} from '../codegen';

import ModificationT = Modification.ModificationTypeEnum;
import PartyModificationT = PartyModificationType.PartyModificationTypeEnum;
import ContractorModificationT = ContractorModification.ContractorModificationTypeEnum;
import ContractModificationT = ContractModification.ContractModificationTypeEnum;
import ContractorT = ContractorType.ContractorTypeEnum;
import LegalEntityT = LegalEntityType.LegalEntityTypeEnum;
import PayoutToolModificationT = ContractPayoutToolModification.PayoutToolModificationTypeEnum;
import PayoutToolT = PayoutToolInfo.PayoutToolTypeEnum;
import ShopModificationT = ShopModification.ShopModificationTypeEnum;
import ShopLocationT = ShopLocation.LocationTypeEnum;

/* Contract changes and defaults */

export const defaultPayoutToolInfo = {
    payoutToolType: PayoutToolT.RussianBankAccount,
    account: '40703810432060000034',
    bankName: 'ФИЛИАЛ "САНКТ-ПЕТЕРБУРГСКИЙ" АО "АЛЬФА-БАНК"',
    bankPostAccount: '30101810600000000786',
    bankBik: '044030786'
} as RussianBankAccount;

export const defaultLegalEntity = {
    legalEntityType: LegalEntityT.RussianLegalEntity,
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
    russianBankAccount: defaultPayoutToolInfo
} as LegalEntityType;

export const defaultContractor = {
    contractorType: ContractorT.LegalEntity,
    legalEntityType: defaultLegalEntity
} as ContractorType;

export const defaultLegalAgreement = {
    legalAgreementID: '006815/07',
    signedAt: moment()
        .subtract(1, 'days')
        .utc()
        .format() as any
} as LegalAgreement;

export function getDefaultWalletInfo(walletID?: string): WalletInfo {
    return {
        payoutToolType: PayoutToolT.WalletInfo,
        walletID: walletID || '1'
    };
}

export function contractorCreationChange(contractorID: string): Modification {
    let contractorModification = {
        partyModificationType: PartyModificationT.ContractorModificationUnit,
        id: contractorID,
        modification: {
            contractorModificationType: ContractorModificationT.Contractor,
            contractorType: defaultContractor
        } as Contractor
    } as ContractorModificationUnit;
    return {
        modificationType: ModificationT.PartyModification,
        partyModificationType: contractorModification
    } as Modification;
}

export function contractCreationChange(
    contractID: string,
    paymentInstitutionID: number,
    contractorID: string
): Modification {
    let contractModification = {
        partyModificationType: PartyModificationT.ContractModificationUnit,
        id: contractID,
        modification: {
            contractModificationType: ContractModificationT.ContractCreationModification,
            paymentInstitution: {id: paymentInstitutionID},
            contractorID: contractorID
        } as ContractCreationModification
    } as ContractModificationUnit;
    return {
        modificationType: ModificationT.PartyModification,
        partyModificationType: contractModification
    } as Modification;
}

export function contractPayoutToolCreationChange(
    contractID: string,
    payoutToolID: string,
    currency: string,
    info?: PayoutToolInfo
): Modification {
    let payoutToolModification = {
        payoutToolModificationType: PayoutToolModificationT.ContractPayoutToolCreationModification,
        currency: { symbolicCode: currency } as CurrencyRef,
        toolInfo: info || defaultPayoutToolInfo
    } as ContractPayoutToolCreationModification;
    let contractModification = {
        partyModificationType: PartyModificationT.ContractModificationUnit,
        id: contractID,
        modification: {
            contractModificationType: ContractModificationT.ContractPayoutToolModificationUnit,
            payoutToolID,
            modification: payoutToolModification
        }
    } as ContractModificationUnit;
    return {
        modificationType: ModificationT.PartyModification,
        partyModificationType: contractModification
    } as Modification;
}

export function contractPayoutToolWalletCreationChange(
    contractID: string,
    payoutToolID: string,
    currency: string,
    walletID?: string
): Modification {
    return contractPayoutToolCreationChange(
        contractID,
        payoutToolID,
        currency,
        getDefaultWalletInfo(walletID)
    );
}

export function contractLegalAgreementBindingChange(
    contractID: string,
    legalAgreement?: LegalAgreement
): Modification {
    let contractModification = {
        partyModificationType: PartyModificationT.ContractModificationUnit,
        id: contractID,
        modification: {
            contractModificationType: ContractModificationT.ContractLegalAgreementBindingModification,
            legalAgreement: legalAgreement || defaultLegalAgreement
        } as ContractLegalAgreementBindingModification
    } as ContractModificationUnit;
    return {
        modificationType: ModificationT.PartyModification,
        partyModificationType: contractModification
    } as Modification;
}

/* Shop changes and defaults */

export function shopCreationChange(
    shopID: string,
    contractID: string,
    payoutToolID: string,
    categoryID: number
): Modification {
    let shopModification = {
        partyModificationType: PartyModificationT.ShopModificationUnit,
        id: shopID,
        modification: {
            shopModificationType: ShopModificationT.ShopCreationModification,
            category: { categoryID } as CategoryRef,
            location: {
                locationType: ShopLocationT.ShopLocationUrl,
                url: 'http://test.url'
            } as ShopLocationUrl,
            details: {
                name: 'Test shop',
                description: 'Shop for test integration'
            } as ShopDetails,
            contractID: contractID,
            payoutToolID: payoutToolID
        } as ShopCreationModification
    } as ShopModificationUnit;
    return {
        modificationType: ModificationT.PartyModification,
        partyModificationType: shopModification
    } as Modification;
}

export function shopAccountCreationChange(
    shopID: string,
    currency: string
): Modification {
    let shopModification = {
        partyModificationType: PartyModificationT.ShopModificationUnit,
        id: shopID,
        modification: {
            shopModificationType: ShopModificationT.ShopAccountCreationModification,
            currency: { symbolicCode: currency } as CurrencyRef
        } as ShopAccountCreationModification
    } as ShopModificationUnit;
    return {
        modificationType: ModificationT.PartyModification,
        partyModificationType: shopModification
    } as Modification;
}

export function shopPayoutScheduleChange(
    shopID: string,
    scheduleID: number | undefined
): Modification {
    let shopModification = {
        partyModificationType: PartyModificationT.ShopModificationUnit,
        id: shopID,
        modification: {
            shopModificationType: ShopModificationT.ShopPayoutScheduleModification,
            schedule: scheduleID !== undefined
                ? { id: scheduleID } as BusinessScheduleRef
                : undefined
        } as ShopPayoutScheduleModification
    } as ShopModificationUnit;
    return {
        modificationType: ModificationT.PartyModification,
        partyModificationType: shopModification
    } as Modification;
}
