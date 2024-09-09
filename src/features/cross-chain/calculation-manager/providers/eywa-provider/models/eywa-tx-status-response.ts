export interface EywaTxStatusResponse {
    inconsistency: boolean;
    destination: {
        status: 'in progress' | 'completed';
        emergency: boolean;
        transactionHash: string;
        chainId: string;
        events: EywaArgs[];
    };
}
interface EywaArgs {
    args: {
        nextRequestId: string;
    };
}
