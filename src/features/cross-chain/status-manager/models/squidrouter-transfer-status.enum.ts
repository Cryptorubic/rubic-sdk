export enum SquidrouterTransferStatus {
    SRC_GATEWAY_CALLED = 'source_gateway_called',
    DEST_GATEWAY_APPROVED = 'destination_gateway_approved',
    DEST_EXECUTED = 'destination_executed',
    DEST_ERROR = 'error',
    ERROR_FETCHING_STATUS = 'error_fetching_status'
}
