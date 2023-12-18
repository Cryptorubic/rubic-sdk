export interface OdosSwapRequestParams {
    userAddr: string;
    pathId: string;
    simulate?: boolean;
}

export interface OdosSwapResponse {
    inputTokens: OdosInputTokenResponse[];
    outputTokens: OdosOutputTokenResponse[];
    outValues: string[];
    transaction: OdosTx | null;
    simulation: OdosSimulation | null;
    netOutValue: number;
    blockNumber: number;
    gasEstimate: number;
    gasEstimateValue: number;
    deprecated: string | null;
}

export interface OdosTx {
    gas: number;
    gasPrice: number;
    value: string;
    to: string;
    from: string;
    data: string;
    nonce: number;
    chainId: number;
}

interface OdosSimulation {
    isSuccess: boolean;
    amountsOut: number[];
    gasEstimate: number;
    simulationError: OdosSimulationError | null;
}

interface OdosSimulationError {
    type: string;
    errorMessage: string;
}

interface OdosInputTokenResponse {
    tokenAddress: string;
    amount: number;
}

interface OdosOutputTokenResponse {
    tokenAddress: string;
    amount: number;
}
