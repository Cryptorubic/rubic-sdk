import { SwapStep } from '@dedust/sdk';
import { Address } from '@ton/core';
import { DedustSwapService } from '../../../src/features/on-chain/calculation-manager/providers/aggregators/dedust/services/dedust-swap-service';

interface TestCase {
    caseName: string;
    payload: SwapStep;
    expects: boolean;
}

describe('dedust', () => {
    const swapSrv = new DedustSwapService();
    const testCases = [
        {
            caseName: '1_item_payload_correct',
            expects: true,
            payload: {
                poolAddress: Address.parse('EQBGCoxXu8a_CdJ5r1u2iiWUvJAAHvVU7qZgEmfKRSfBf2CW'),
                limit: BigInt(1)
            }
        },
        {
            caseName: '1_item_payload_empty_next',
            expects: false,
            payload: {
                poolAddress: Address.parse('EQBGCoxXu8a_CdJ5r1u2iiWUvJAAHvVU7qZgEmfKRSfBf2CW'),
                limit: BigInt(1),
                next: {}
            }
        },
        {
            caseName: '2_item_payload_empty_next',
            expects: false,
            payload: {
                poolAddress: Address.parse('EQBGCoxXu8a_CdJ5r1u2iiWUvJAAHvVU7qZgEmfKRSfBf2CW'),
                limit: BigInt(1),
                next: {
                    poolAddress: Address.parse('EQBGCoxXu8a_CdJ5r1u2iiWUvJAAHvVU7qZgEmfKRSfBf2CW'),
                    limit: BigInt(1),
                    next: {}
                }
            }
        },
        {
            caseName: '2_item_payload_empty_poolAddress',
            expects: false,
            payload: {
                poolAddress: Address.parse('EQBGCoxXu8a_CdJ5r1u2iiWUvJAAHvVU7qZgEmfKRSfBf2CW'),
                limit: BigInt(1),
                next: {
                    poolAddress: '',
                    limit: BigInt(1)
                }
            }
        },
        {
            caseName: '2_item_payload_undefined_poolAddress',
            expects: false,
            payload: {
                poolAddress: Address.parse('EQBGCoxXu8a_CdJ5r1u2iiWUvJAAHvVU7qZgEmfKRSfBf2CW'),
                limit: BigInt(1),
                next: {
                    poolAddress: undefined,
                    limit: BigInt(1)
                }
            }
        },
        {
            caseName: '2_item_payload_correct',
            expects: true,
            payload: {
                poolAddress: Address.parse('EQBGCoxXu8a_CdJ5r1u2iiWUvJAAHvVU7qZgEmfKRSfBf2CW'),
                limit: BigInt(1),
                next: {
                    poolAddress: Address.parse('EQBGCoxXu8a_CdJ5r1u2iiWUvJAAHvVU7qZgEmfKRSfBf2CW'),
                    limit: BigInt(1)
                }
            }
        },
        {
            caseName: '3_item_payload_correct',
            expects: true,
            payload: {
                poolAddress: Address.parse('EQBGCoxXu8a_CdJ5r1u2iiWUvJAAHvVU7qZgEmfKRSfBf2CW'),
                limit: BigInt(1),
                next: {
                    poolAddress: Address.parse('EQBGCoxXu8a_CdJ5r1u2iiWUvJAAHvVU7qZgEmfKRSfBf2CW'),
                    limit: BigInt(1),
                    next: {
                        poolAddress: Address.parse(
                            'EQBGCoxXu8a_CdJ5r1u2iiWUvJAAHvVU7qZgEmfKRSfBf2CW'
                        ),
                        limit: BigInt(1)
                    }
                }
            }
        },
        {
            caseName: '3_item_payload_empty_next',
            expects: false,
            payload: {
                poolAddress: Address.parse('EQBGCoxXu8a_CdJ5r1u2iiWUvJAAHvVU7qZgEmfKRSfBf2CW'),
                limit: BigInt(1),
                next: {
                    poolAddress: Address.parse('EQBGCoxXu8a_CdJ5r1u2iiWUvJAAHvVU7qZgEmfKRSfBf2CW'),
                    limit: BigInt(1),
                    next: {
                        poolAddress: Address.parse(
                            'EQBGCoxXu8a_CdJ5r1u2iiWUvJAAHvVU7qZgEmfKRSfBf2CW'
                        ),
                        limit: BigInt(1),
                        next: {}
                    }
                }
            }
        },
        {
            caseName: '3_item_payload_empty_poolAddress',
            expects: false,
            payload: {
                poolAddress: Address.parse('EQBGCoxXu8a_CdJ5r1u2iiWUvJAAHvVU7qZgEmfKRSfBf2CW'),
                limit: BigInt(1),
                next: {
                    poolAddress: Address.parse('EQBGCoxXu8a_CdJ5r1u2iiWUvJAAHvVU7qZgEmfKRSfBf2CW'),
                    limit: BigInt(1),
                    next: {
                        poolAddress: '',
                        limit: BigInt(1),
                        next: {}
                    }
                }
            }
        },
        {
            caseName: '4_item_payload_correct',
            expects: true,
            payload: {
                poolAddress: Address.parse('EQBGCoxXu8a_CdJ5r1u2iiWUvJAAHvVU7qZgEmfKRSfBf2CW'),
                limit: BigInt(1),
                next: {
                    poolAddress: Address.parse('EQBGCoxXu8a_CdJ5r1u2iiWUvJAAHvVU7qZgEmfKRSfBf2CW'),
                    limit: BigInt(1),
                    next: {
                        poolAddress: Address.parse(
                            'EQBGCoxXu8a_CdJ5r1u2iiWUvJAAHvVU7qZgEmfKRSfBf2CW'
                        ),
                        limit: BigInt(1),
                        next: {
                            poolAddress: Address.parse(
                                'EQBGCoxXu8a_CdJ5r1u2iiWUvJAAHvVU7qZgEmfKRSfBf2CW'
                            ),
                            limit: BigInt(1)
                        }
                    }
                }
            }
        },
        {
            caseName: '4_item_payload_empty_next',
            expects: false,
            payload: {
                poolAddress: Address.parse('EQBGCoxXu8a_CdJ5r1u2iiWUvJAAHvVU7qZgEmfKRSfBf2CW'),
                limit: BigInt(1),
                next: {
                    poolAddress: Address.parse('EQBGCoxXu8a_CdJ5r1u2iiWUvJAAHvVU7qZgEmfKRSfBf2CW'),
                    limit: BigInt(1),
                    next: {
                        poolAddress: Address.parse(
                            'EQBGCoxXu8a_CdJ5r1u2iiWUvJAAHvVU7qZgEmfKRSfBf2CW'
                        ),
                        limit: BigInt(1),
                        next: {
                            poolAddress: Address.parse(
                                'EQBGCoxXu8a_CdJ5r1u2iiWUvJAAHvVU7qZgEmfKRSfBf2CW'
                            ),
                            limit: BigInt(1),
                            next: {}
                        }
                    }
                }
            }
        },
        {
            caseName: '4_item_payload_null_poolAddress',
            expects: false,
            payload: {
                poolAddress: Address.parse('EQBGCoxXu8a_CdJ5r1u2iiWUvJAAHvVU7qZgEmfKRSfBf2CW'),
                limit: BigInt(1),
                next: {
                    poolAddress: Address.parse('EQBGCoxXu8a_CdJ5r1u2iiWUvJAAHvVU7qZgEmfKRSfBf2CW'),
                    limit: BigInt(1),
                    next: {
                        poolAddress: Address.parse(
                            'EQBGCoxXu8a_CdJ5r1u2iiWUvJAAHvVU7qZgEmfKRSfBf2CW'
                        ),
                        limit: BigInt(1),
                        next: {
                            poolAddress: null,
                            limit: BigInt(1)
                        }
                    }
                }
            }
        }
    ] as TestCase[];

    it('tt', () => {
        for (const testCase of testCases) {
            const answer = swapSrv.checkSwapPayloadValid(testCase.payload);
            expect(answer).toBe(testCase.expects);
        }
    });
});
