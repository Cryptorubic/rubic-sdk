export interface RetroBridgeTrade {
    /**
     * RetroBridge order ID
     */
    retroBridgeId: string;

    /**
     * Auto wallet on RetroBridge backend
     */
    // authWallet(): Promise<never | void>;

    /**
     * Do wallet need auth or not
     */
    // needAuthWallet(): Promise<boolean>;
}
