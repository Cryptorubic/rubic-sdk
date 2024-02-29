export const openOceanApiUrl = {
    tokenList: (chain: string) => `https://x-api.rubic.exchange/oo/api/token_list/${chain}`,
    quote: (chain: string) => `https://x-api.rubic.exchange/oo/api/v3/${chain}/quote`,
    swapQuote: (chain: string) => `https://x-api.rubic.exchange/oo/api/v3/${chain}/swap_quote`
};
