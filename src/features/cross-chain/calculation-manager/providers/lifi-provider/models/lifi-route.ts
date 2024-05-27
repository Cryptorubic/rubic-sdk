import { Action, AllowDenyPrefer, Insurance, LifiStep, Token } from "@lifi/sdk";

export declare const Orders: readonly ["RECOMMENDED", "FASTEST", "CHEAPEST", "SAFEST"];
export type Order = (typeof Orders)[number];
export interface RoutesRequest {
    fromChainId: number;
    fromAmount: string;
    fromTokenAddress: string;
    fromAddress?: string;
    toChainId: number;
    toTokenAddress: string;
    toAddress?: string;
    options?: RouteOptions;
    fromAmountForGas?: string;
}
export interface RouteOptions {
    order?: Order;
    slippage?: number;
    infiniteApproval?: boolean;
    allowSwitchChain?: boolean;
    integrator?: string;
    allowDestinationCall?: boolean;
    referrer?: string;
    bridges?: AllowDenyPrefer;
    exchanges?: AllowDenyPrefer;
    fee?: number;
    insurance?: boolean;
    maxPriceImpact?: number;
}

export interface Route {
    id: string;
    insurance: Insurance;
    fromChainId: number;
    fromAmountUSD: string;
    fromAmount: string;
    fromToken: Token;
    fromAddress?: string;
    toChainId: number;
    toAmountUSD: string;
    toAmount: string;
    toAmountMin: string;
    toToken: Token;
    toAddress?: string;
    gasCostUSD?: string;
    containsSwitchChain?: boolean;
    infiniteApproval?: boolean;
    steps: LifiStep[];
    tags?: Order[];
}
export type UnavailableRoutes = {
    filteredOut: FilteredResult[];
    failed: ErroredRoute[];
};
export interface RoutesResponse {
    routes: Route[];
    unavailableRoutes: UnavailableRoutes;
}
export type ErroredPaths = {
    [subpath: string]: ToolError[];
};
export type ErroredRoute = {
    overallPath: string;
    subpaths: ErroredPaths;
};
export type FilteredResult = {
    overallPath: string;
    reason: string;
};

export type ToolErrorType = 'NO_QUOTE';
export interface ToolError {
    errorType: ToolErrorType;
    code: string;
    action: Action;
    tool: string;
    message: string;
}