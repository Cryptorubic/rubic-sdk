import { BLOCKCHAIN_NAME } from '../models/BLOCKCHAIN_NAME';
import { Web3Public } from './web3-public';
import { RpcProvider } from '../../sdk/models/configuration';
export declare class Web3PublicService {
    private rpcList;
    private static readonly mainRpcDefaultTimeout;
    private static readonly healthCheckDefaultTimeout;
    static createWeb3PublicService(rpcList: Partial<Record<BLOCKCHAIN_NAME, RpcProvider>>): Promise<Web3PublicService>;
    private web3PublicStorage;
    constructor(rpcList: Partial<Record<BLOCKCHAIN_NAME, RpcProvider>>);
    getWeb3Public(blockchainName: BLOCKCHAIN_NAME): Web3Public;
    private createAndCheckWeb3Public;
    private createWeb3Public;
}
