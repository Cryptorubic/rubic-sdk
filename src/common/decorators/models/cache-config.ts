/**
 * Configuration, used for cache decorator.
 */
export interface CacheConfig {
    /**
     * Amount of time, during which cached result is relevant.
     */
    maxAge?: number;

    /**
     * If true, then results must be of type {@link ConditionalResult},
     * defining whether to cache calculated result.
     */
    conditionalCache?: boolean;
}
