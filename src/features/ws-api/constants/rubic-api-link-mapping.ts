import { EnvType } from 'src/core/sdk/models/env-type';

export const rubicApiLinkMapping: Record<EnvType, string> = {
    local: 'http://localhost:3000',
    dev: 'https://dev1-api-v2.rubic.exchange',
    dev2: 'https://dev2-api-v2.rubic.exchange',
    dev3: 'https://dev3-api-v2.rubic.exchange',
    rubic: 'https://dev2-api-v2.rubic.exchange',
    prod: 'https://api-v2.rubic.exchange'
};
