export interface ContractMulticallResponse<Output> {
    success: boolean;
    output: Output | null;
}
