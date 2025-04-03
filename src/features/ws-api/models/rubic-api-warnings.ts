import { RubicSdkError } from 'src/common/errors';

export interface RubicApiWarnings {
    needAuthWallet: boolean;
    error?: RubicSdkError;
}
