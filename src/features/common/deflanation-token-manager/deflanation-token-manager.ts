import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Injector } from 'src/core/injector/injector';
import { simulatorContractAbi } from './constants/simulator-contract-abi';
import { simulatorContractAddress } from './constants/simulator-contract-address';

export class DeflanationTokenManager {
    constructor() {}

    public async simulateTransfer(
        token: PriceTokenAmount<EvmBlockchainName>,
        amount: string
    ): Promise<void> {
        const web3Private = Injector.web3PrivateService.getWeb3PrivateByBlockchain(
            token.blockchain
        );
        const simulatorAddress = simulatorContractAddress['POLYGON'];

        try {
            await web3Private.tryExecuteContractMethod(
                simulatorAddress,
                simulatorContractAbi,
                'simulateTransfer',
                [token.address, amount]
            );
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    public async simulateTransferWithSwap(
        dexAddress: string,
        token: PriceTokenAmount<EvmBlockchainName>,
        data: string
    ): Promise<void> {
        const web3Private = Injector.web3PrivateService.getWeb3PrivateByBlockchain(
            token.blockchain
        );
        const simulatorAddress = simulatorContractAddress['POLYGON'];

        try {
            await web3Private.tryExecuteContractMethod(
                simulatorAddress,
                simulatorContractAbi,
                'simulateTransferWithSwap',
                [dexAddress, token.address, data]
            );
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    public async simulateBuyWithSwap(
        dexAddress: string,
        amountIn: BigNumber,
        path: string[],
        token: PriceTokenAmount<EvmBlockchainName>,
        data: string
    ): Promise<void> {
        const web3Private = Injector.web3PrivateService.getWeb3PrivateByBlockchain(
            token.blockchain
        );
        const simulatorAddress = simulatorContractAddress['POLYGON'];

        try {
            await web3Private.tryExecuteContractMethod(
                simulatorAddress,
                simulatorContractAbi,
                'simulateTransferWithSwap',
                [dexAddress, amountIn.toString(), path, token.address, data]
            );
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    public async simulateSellWithSwap(
        dexAddress: string,
        amountIn: BigNumber,
        path: string[],
        token: PriceTokenAmount<EvmBlockchainName>,
        dataBuy: string,
        dataSell: string
    ): Promise<void> {
        const web3Private = Injector.web3PrivateService.getWeb3PrivateByBlockchain(
            token.blockchain
        );
        const simulatorAddress = simulatorContractAddress['POLYGON'];

        try {
            await web3Private.tryExecuteContractMethod(
                simulatorAddress,
                simulatorContractAbi,
                'simulateTransferWithSwap',
                [dexAddress, amountIn.toString(), path, token.address, dataBuy, dataSell]
            );
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}
