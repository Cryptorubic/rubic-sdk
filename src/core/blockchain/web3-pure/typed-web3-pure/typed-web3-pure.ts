export interface TypedWeb3Pure {
    /**
     * Gets address of native coin.
     */
    get nativeTokenAddress(): string; // @todo rename

    /**
     * Checks if address is native address.
     * @param address Address to check.
     */
    isNativeAddress(address: string): boolean;

    isEmptyAddress(address: string): boolean;

    /**
     * Checks if a given address is a valid Ethereum address.
     * @param address The address to check validity of.
     */
    isAddressCorrect(address: string): boolean;
}
