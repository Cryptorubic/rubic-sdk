import BigNumber from 'bignumber.js';
import { staticImplements } from 'src/common/utils/decorators';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { Web3PureContainer } from 'src/core/blockchain/web3-pure/models/web3-pure-container';
import { BitcoinWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/bitcoin-web3-pure';
import { EosWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/eos-web3-pure';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { FilecoinWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/filecoin-web3-pure';
import { IcpWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/icp-web3-pure';
import { AlgorandWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/non-evm-web3-pure/algorand-web3-pure';
import { AptosWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/non-evm-web3-pure/aptos-web3-pure';
import { AstarWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/non-evm-web3-pure/astar-web3-pure';
import { CardanoWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/non-evm-web3-pure/cardano-web3-pure';
import { CasperWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/non-evm-web3-pure/casper-web3-pure';
import { CosmosWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/non-evm-web3-pure/cosmos-web3-pure';
import { DashWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/non-evm-web3-pure/dash-web3-pure';
import { DogecoinWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/non-evm-web3-pure/dogecoin-web3-pure';
import { FlowWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/non-evm-web3-pure/flow-web3-pure';
import { HederaWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/non-evm-web3-pure/hedear-web3-pure';
import { IotaWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/non-evm-web3-pure/iota-web3-pure';
import { KadenaWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/non-evm-web3-pure/kadena-web3-pure';
import { KavaCosmosWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/non-evm-web3-pure/kava-cosmos-web3-pure';
import { KusamaWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/non-evm-web3-pure/kusama-web3-pure';
import { LitecoinWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/non-evm-web3-pure/litecoin-web3-pure';
import { MinaWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/non-evm-web3-pure/mina-web3-pure';
import { MoneroWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/non-evm-web3-pure/monero-web3-pure';
import { NearWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/non-evm-web3-pure/near-web3-pure';
import { NeoWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/non-evm-web3-pure/neo-web3-pure';
import { OsmosisWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/non-evm-web3-pure/osmosis-web3-pure';
import { PolkadotWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/non-evm-web3-pure/polkadot-web3-pure';
import { RippleWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/non-evm-web3-pure/ripple-web3-pure';
import { SecretWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/non-evm-web3-pure/secret-web3-pure';
import { SiaWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/non-evm-web3-pure/sia-web3-pure';
import { StellarWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/non-evm-web3-pure/stellar-web3-pure';
import { TezosWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/non-evm-web3-pure/tezos-web3-pure';
import { WavesWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/non-evm-web3-pure/waves-web3-pure';
import { WaxWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/non-evm-web3-pure/wax-web3-pure';
import { ZilliqaWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/non-evm-web3-pure/zilliqa-web3-pure';
import { OntologyWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/ontology-web3-pure';
import { SolanaWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/solana-web3-pure/solana-web3-pure';
import { TonWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/ton-web3-pure/ton-web3-pure';
import { TronWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/tron-web3-pure';
import { XdcWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/xdc-web3-pure';

import { SuiWeb3Pure } from './typed-web3-pure/sui-web3-pure';

/**
 * Contains common methods, connected with web3, e.g. wei conversion, encoding data, etc.
 */
@staticImplements<Web3PureContainer>()
export class Web3Pure {
    public static [CHAIN_TYPE.EVM] = EvmWeb3Pure;

    public static [CHAIN_TYPE.TRON] = TronWeb3Pure;

    public static [CHAIN_TYPE.BITCOIN] = BitcoinWeb3Pure;

    public static [CHAIN_TYPE.ICP] = IcpWeb3Pure;

    public static [CHAIN_TYPE.RIPPLE] = RippleWeb3Pure;

    public static [CHAIN_TYPE.CARDANO] = CardanoWeb3Pure;

    public static [CHAIN_TYPE.SOLANA] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.DOGECOIN] = DogecoinWeb3Pure;

    public static [CHAIN_TYPE.POLKADOT] = PolkadotWeb3Pure;

    public static [CHAIN_TYPE.LITECOIN] = LitecoinWeb3Pure;

    public static [CHAIN_TYPE.MONERO] = MoneroWeb3Pure;

    public static [CHAIN_TYPE.NEAR] = NearWeb3Pure;

    public static [CHAIN_TYPE.ALGORAND] = AlgorandWeb3Pure;

    public static [CHAIN_TYPE.TEZOS] = TezosWeb3Pure;

    public static [CHAIN_TYPE.DASH] = DashWeb3Pure;

    public static [CHAIN_TYPE.ZILLIQA] = ZilliqaWeb3Pure;

    public static [CHAIN_TYPE.KAVA_COSMOS] = KavaCosmosWeb3Pure;

    public static [CHAIN_TYPE.APTOS] = AptosWeb3Pure;

    public static [CHAIN_TYPE.ASTAR] = AstarWeb3Pure;

    public static [CHAIN_TYPE.COSMOS] = CosmosWeb3Pure;

    public static [CHAIN_TYPE.FLOW] = FlowWeb3Pure;

    public static [CHAIN_TYPE.HEDERA] = HederaWeb3Pure;

    public static [CHAIN_TYPE.BITCOIN_DIAMOND] = BitcoinWeb3Pure;

    public static [CHAIN_TYPE.BITCOIN_GOLD] = BitcoinWeb3Pure;

    public static [CHAIN_TYPE.BSV] = BitcoinWeb3Pure;

    public static [CHAIN_TYPE.IOTA] = IotaWeb3Pure;

    public static [CHAIN_TYPE.KADENA] = KadenaWeb3Pure;

    public static [CHAIN_TYPE.KUSAMA] = KusamaWeb3Pure;

    public static [CHAIN_TYPE.MINA_PROTOCOL] = MinaWeb3Pure;

    public static [CHAIN_TYPE.NEO] = NeoWeb3Pure;

    public static [CHAIN_TYPE.OSMOSIS] = OsmosisWeb3Pure;

    public static [CHAIN_TYPE.SIA] = SiaWeb3Pure;

    public static [CHAIN_TYPE.SECRET] = SecretWeb3Pure;

    public static [CHAIN_TYPE.TON] = TonWeb3Pure;

    public static [CHAIN_TYPE.WAVES] = WavesWeb3Pure;

    public static [CHAIN_TYPE.WAX] = WaxWeb3Pure;

    public static [CHAIN_TYPE.STELLAR] = StellarWeb3Pure;

    public static [CHAIN_TYPE.XDC] = XdcWeb3Pure;

    public static [CHAIN_TYPE.ONTOLOGY] = OntologyWeb3Pure;

    public static [CHAIN_TYPE.EOS] = EosWeb3Pure;

    public static [CHAIN_TYPE.FILECOIN] = FilecoinWeb3Pure;

    public static [CHAIN_TYPE.CASPER] = CasperWeb3Pure;

    // @TODO create web3pure file before release

    public static [CHAIN_TYPE.SUI] = SuiWeb3Pure;

    public static [CHAIN_TYPE.AION] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.ARDOR] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.ARK] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.BAND_PROTOCOL] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.DECRED] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.DIGI_BYTE] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.DIVI] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.MULTIVERS_X] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.FIO_PROTOCOL] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.FIRO] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.HELIUM] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.ICON] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.IOST] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.KOMODO] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.LISK] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.TERRA] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.TERRA_CLASSIC] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.NANO] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.PIVX] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.POLYX] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.QTUM] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.THOR_CHAIN] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.RAVENCOIN] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.STEEM] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.STRATIS] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.STACKS] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.SOLAR] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.VE_CHAIN] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.DX_CHAIN] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.E_CASH] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.NEM] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.VERGE] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.SYMBOL] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.ZCASH] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.HORIZEN] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.BITCOIN_CASH] = BitcoinWeb3Pure;

    /**
     * Increases the gas limit value by the specified percentage and rounds to the nearest integer.
     * @param gasLimit Gas limit value to increase.
     * @param multiplier The multiplier by which the gas limit will be increased.
     */
    public static calculateGasMargin(
        gasLimit: BigNumber | string | number | null | undefined,
        multiplier: number
    ): BigNumber {
        return new BigNumber(gasLimit || '0').multipliedBy(multiplier).dp(0);
    }

    /**
     * Converts amount from Ether to Wei units.
     * @param amount Amount to convert.
     * @param decimals Token decimals.
     * @param roundingMode BigNumberRoundingMode.
     */
    public static toWei(
        amount: BigNumber | string | number,
        decimals = 18,
        roundingMode?: BigNumber.RoundingMode
    ): string {
        return new BigNumber(amount || 0)
            .times(new BigNumber(10).pow(decimals))
            .toFixed(0, roundingMode);
    }

    /**
     * Converts amount from Wei to Ether units.
     * @param amountInWei Amount to convert.
     * @param decimals Token decimals.
     */
    public static fromWei(amountInWei: BigNumber | string | number, decimals = 18): BigNumber {
        return new BigNumber(amountInWei).div(new BigNumber(10).pow(decimals));
    }
}
