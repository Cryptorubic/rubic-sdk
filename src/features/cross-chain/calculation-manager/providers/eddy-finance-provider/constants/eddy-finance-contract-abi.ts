import { AbiItem } from "@1inch/limit-order-protocol-utils";


export const eddyFinanceContractAbi: AbiItem[]=
    [
        {
          inputs: [
            {
              internalType: "address",
              name: "systemContractAddress",
              type: "address"
            },
            {
              internalType: "address",
              name: "wrappedZetaToken",
              type: "address"
            },
            {
              internalType: "address",
              name: "_pythContractAddress",
              type: "address"
            },
            {
              internalType: "uint256",
              name: "_platformFee",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "_slippage",
              type: "uint256"
            }
          ],
          stateMutability: "nonpayable",
          type: "constructor"
        },
        {
          inputs: [],
          name: "CantBeIdenticalAddresses",
          type: "error"
        },
        {
          inputs: [],
          name: "CantBeZeroAddress",
          type: "error"
        },
        {
          inputs: [],
          name: "IdenticalAddresses",
          type: "error"
        },
        {
          inputs: [],
          name: "NoPriceData",
          type: "error"
        },
        {
          inputs: [],
          name: "NotEnoughToPayGasFee",
          type: "error"
        },
        {
          inputs: [],
          name: "SenderNotSystemContract",
          type: "error"
        },
        {
          inputs: [],
          name: "WrongAmount",
          type: "error"
        },
        {
          inputs: [],
          name: "WrongGasContract",
          type: "error"
        },
        {
          inputs: [],
          name: "ZeroAddress",
          type: "error"
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "address",
              name: "zrc20",
              type: "address"
            },
            {
              indexed: false,
              internalType: "address",
              name: "targetZRC20",
              type: "address"
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "amount",
              type: "uint256"
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "outputAmount",
              type: "uint256"
            },
            {
              indexed: false,
              internalType: "address",
              name: "walletAddress",
              type: "address"
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "fees",
              type: "uint256"
            }
          ],
          name: "EddyCrossChainSwap",
          type: "event"
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "previousOwner",
              type: "address"
            },
            {
              indexed: true,
              internalType: "address",
              name: "newOwner",
              type: "address"
            }
          ],
          name: "OwnershipTransferred",
          type: "event"
        },
        {
          stateMutability: "payable",
          type: "fallback"
        },
        {
          inputs: [],
          name: "AZETA",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address"
            }
          ],
          stateMutability: "view",
          type: "function"
        },
        {
          inputs: [],
          name: "BTC_ZETH",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address"
            }
          ],
          stateMutability: "view",
          type: "function"
        },
        {
          inputs: [],
          name: "UniswapFactory",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address"
            }
          ],
          stateMutability: "view",
          type: "function"
        },
        {
          inputs: [],
          name: "UniswapRouter",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address"
            }
          ],
          stateMutability: "view",
          type: "function"
        },
        {
          inputs: [],
          name: "WZETA",
          outputs: [
            {
              internalType: "contract IWZETA",
              name: "",
              type: "address"
            }
          ],
          stateMutability: "view",
          type: "function"
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "",
              type: "address"
            }
          ],
          name: "addressToTokenId",
          outputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32"
            }
          ],
          stateMutability: "view",
          type: "function"
        },
        {
          inputs: [
            {
              "components": [
                {
                  internalType: "bytes",
                  name: "origin",
                  type: "bytes"
                },
                {
                  internalType: "address",
                  name: "sender",
                  type: "address"
                },
                {
                  internalType: "uint256",
                  name: "chainID",
                  type: "uint256"
                }
              ],
              internalType: "struct zContext",
              name: "context",
              type: "tuple"
            },
            {
              internalType: "address",
              name: "zrc20",
              type: "address"
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256"
            },
            {
              internalType: "bytes",
              name: "message",
              type: "bytes"
            }
          ],
          name: "onCrossChainCall",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function"
        },
        {
          inputs: [],
          name: "owner",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address"
            }
          ],
          stateMutability: "view",
          type: "function"
        },
        {
          inputs: [],
          name: "platformFee",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256"
            }
          ],
          stateMutability: "view",
          type: "function"
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "",
              type: "address"
            }
          ],
          name: "prices",
          outputs: [
            {
              internalType: "int64",
              name: "",
              type: "int64"
            }
          ],
          stateMutability: "view",
          type: "function"
        },
        {
          inputs: [],
          name: "renounceOwnership",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function"
        },
        {
          inputs: [],
          name: "slippage",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256"
            }
          ],
          stateMutability: "view",
          type: "function"
        },
        {
          inputs: [],
          name: "systemContract",
          outputs: [
            {
              internalType: "contract SystemContract",
              name: "",
              type: "address"
            }
          ],
          stateMutability: "view",
          type: "function"
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "newOwner",
              type: "address"
            }
          ],
          name: "transferOwnership",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function"
        },
        {
          inputs: [
            {
              internalType: "bytes",
              name: "withdrawData",
              type: "bytes"
            },
            {
              internalType: "address",
              name: "zrc20",
              type: "address"
            },
            {
              internalType: "address",
              name: "targetZRC20",
              type: "address"
            }
          ],
          name: "transferZetaToConnectedChain",
          outputs: [],
          stateMutability: "payable",
          type: "function"
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "factory",
              type: "address"
            },
            {
              internalType: "address",
              name: "tokenA",
              type: "address"
            },
            {
              internalType: "address",
              name: "tokenB",
              type: "address"
            }
          ],
          name: "uniswapv2PairFor",
          outputs: [
            {
              internalType: "address",
              name: "pair",
              type: "address"
            }
          ],
          stateMutability: "pure",
          type: "function"
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "tokenId",
              type: "bytes32"
            },
            {
              internalType: "address",
              name: "asset",
              type: "address"
            }
          ],
          name: "updateAddressToTokenId",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function"
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_updatedFee",
              type: "uint256"
            }
          ],
          name: "updatePlatformFee",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function"
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "asset",
              type: "address"
            },
            {
              internalType: "int64",
              name: "price",
              type: "int64"
            }
          ],
          name: "updatePriceForAsset",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function"
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_slippage",
              type: "uint256"
            }
          ],
          name: "updateSlippage",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function"
        },
        {
          inputs: [
            {
              internalType: "bytes",
              name: "withdrawData",
              type: "bytes"
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256"
            },
            {
              internalType: "address",
              name: "zrc20",
              type: "address"
            },
            {
              internalType: "address",
              name: "targetZRC20",
              type: "address"
            }
          ],
          name: "withdrawToNativeChain",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function"
        },
        {
          stateMutability: "payable",
          type: "receive"
        }
      ]
