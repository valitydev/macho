import {
    PrivateDocument,
    RUSDomesticPassportData,
    RUSRetireeInsuranceCertificateData,
    SecuredPrivateDocument
} from '../codegen';
import PrivateDocumentType = PrivateDocument.TypeEnum;
import { IdentityChallenge } from '../../wallet/codegen';
import ric from '../../../../utils/ric-generator';

export function getPassportParams(): RUSDomesticPassportData {
    return {
        type: PrivateDocumentType.RUSDomesticPassportData,
        series: '4567',
        number: '123456',
        issuer: 'Отделение УФМС России по Кемеровской области в Юргинском районе',
        issuerCode: '666-777',
        issuedAt: '2018-11-28',
        familyName: 'Иванов',
        firstName: 'Иван',
        patronymic: 'Иванович',
        birthDate: '2018-11-28',
        birthPlace: 'дер. Белянино'
    };
}

export function getRICParams(): RUSRetireeInsuranceCertificateData {
    return {
        type: PrivateDocumentType.RUSRetireeInsuranceCertificateData,
        number: ric()
    };
}

export function getIdentityChallengeParams(proofs: SecuredPrivateDocument[]): IdentityChallenge {
    return {
        type: 'esia',
        proofs
    };
}
