/**
 * Type of errors, thrown by web3 methods.
 */
export interface Web3Error extends Error {
    code: number;
}
