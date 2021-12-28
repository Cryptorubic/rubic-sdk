export type BasicTransactionOptions = {
    onTransactionHash?: (hash: string) => void;
    gasLimit?: string;
    gasPrice?: string;
};
