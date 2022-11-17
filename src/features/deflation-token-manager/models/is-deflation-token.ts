import BigNumber from 'bignumber.js';

export type IsDeflationToken =
    | {
          isDeflation: false;
      }
    | {
          isDeflation: true;
          percent: BigNumber;
          isWhitelisted: boolean;
      };
