export interface ChangenowPaymentInfo {
    id: string;
    depositAddress: string;
    extraField?: {
        name?: string;
        value?: string;
    };
}
