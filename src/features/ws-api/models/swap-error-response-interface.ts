import { RubicApiErrorDto } from 'src/features/ws-api/models/rubic-api-error';

export interface SwapErrorResponseInterface {
    error: RubicApiErrorDto;
    id: string;
}
