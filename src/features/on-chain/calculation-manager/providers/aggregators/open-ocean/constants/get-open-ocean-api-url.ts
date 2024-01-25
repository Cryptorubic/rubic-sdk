export const openOceanApiUrl = {
    tokenList: (chain: string) => `https://open-api.openocean.finance/v3/${chain}/tokenList`,
    quote: (chain: string) => `https://open-api.openocean.finance/v3/${chain}/quote`,
    swapQuote: (chain: string) => `https://open-api.openocean.finance/v3/${chain}/swap_quote`
};
