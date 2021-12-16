"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Web3Public = void 0;
var bignumber_js_1 = __importDefault(require("bignumber.js"));
var web3_utils_1 = require("web3-utils");
var erc_20_abi_1 = __importDefault(require("../constants/erc-20-abi"));
var native_token_address_1 = require("../constants/native-token-address");
var rubic_error_1 = require("../../common/errors/rubic-error");
var insufficient_funds_error_1 = require("../../common/errors/insufficient-funds-error");
var multicall_addresses_1 = require("./constants/multicall-addresses");
var multicall_abi_1 = require("./constants/multicall-abi");
var Web3Public = (function () {
    function Web3Public(web3, blockchain, httpClient) {
        this.web3 = web3;
        this.blockchain = blockchain;
        this.httpClient = httpClient;
        this.multicallAddresses = multicall_addresses_1.MULTICALL_ADDRESSES;
    }
    Object.defineProperty(Web3Public, "nativeTokenAddress", {
        get: function () {
            return native_token_address_1.NATIVE_TOKEN_ADDRESS;
        },
        enumerable: false,
        configurable: true
    });
    Web3Public.calculateGasMargin = function (amount, percent) {
        return new bignumber_js_1.default(amount || '0').multipliedBy(percent).toFixed(0);
    };
    Web3Public.toWei = function (amount, decimals) {
        if (decimals === void 0) { decimals = 18; }
        return new bignumber_js_1.default(amount || 0).times(new bignumber_js_1.default(10).pow(decimals)).toFixed(0);
    };
    Web3Public.fromWei = function (amountInWei, decimals) {
        if (decimals === void 0) { decimals = 18; }
        return new bignumber_js_1.default(amountInWei).div(new bignumber_js_1.default(10).pow(decimals));
    };
    Web3Public.addressToBytes32 = function (address) {
        if (address.slice(0, 2) !== '0x' || address.length !== 42) {
            console.error('Wrong address format');
            throw new rubic_error_1.RubicError('Wrong address format');
        }
        return "0x" + address.slice(2).padStart(64, '0');
    };
    Web3Public.toChecksumAddress = function (address) {
        return (0, web3_utils_1.toChecksumAddress)(address);
    };
    Web3Public.isAddressCorrect = function (address) {
        return (0, web3_utils_1.isAddress)(address);
    };
    Web3Public.ethToWei = function (value) {
        return (0, web3_utils_1.toWei)(value.toString(), 'ether');
    };
    Web3Public.weiToEth = function (value) {
        return (0, web3_utils_1.fromWei)(value.toString(), 'ether');
    };
    Web3Public.prototype.setProvider = function (provider) {
        this.web3.setProvider(provider);
    };
    Web3Public.prototype.getBlock = function (blockId) {
        if (blockId === void 0) { blockId = 'latest'; }
        return this.web3.eth.getBlock(blockId);
    };
    Web3Public.prototype.getBalance = function (address, tokenAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var balance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(tokenAddress && !Web3Public.isNativeAddress(tokenAddress))) return [3, 2];
                        return [4, this.getTokenBalance(address, tokenAddress)];
                    case 1:
                        balance = _a.sent();
                        return [3, 4];
                    case 2: return [4, this.web3.eth.getBalance(address)];
                    case 3:
                        balance = _a.sent();
                        _a.label = 4;
                    case 4: return [2, new bignumber_js_1.default(balance)];
                }
            });
        });
    };
    Web3Public.prototype.getTokenBalance = function (address, tokenAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var contract, balance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        contract = new this.web3.eth.Contract(erc_20_abi_1.default, tokenAddress);
                        return [4, contract.methods.balanceOf(address).call()];
                    case 1:
                        balance = _a.sent();
                        return [2, new bignumber_js_1.default(balance)];
                }
            });
        });
    };
    Web3Public.prototype.getEstimatedGas = function (contractAbi, contractAddress, methodName, methodArguments, fromAddress, value) {
        return __awaiter(this, void 0, void 0, function () {
            var contract, gasLimit;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        contract = new this.web3.eth.Contract(contractAbi, contractAddress);
                        return [4, (_a = contract.methods)[methodName].apply(_a, methodArguments).estimateGas(__assign({ from: fromAddress, gas: 10000000 }, (value && { value: value })))];
                    case 1:
                        gasLimit = _b.sent();
                        return [2, new bignumber_js_1.default(gasLimit)];
                }
            });
        });
    };
    Web3Public.prototype.getGasPrice = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, this.web3.eth.getGasPrice()];
            });
        });
    };
    Web3Public.prototype.getGasPriceInETH = function () {
        return __awaiter(this, void 0, void 0, function () {
            var gasPrice;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.web3.eth.getGasPrice()];
                    case 1:
                        gasPrice = _a.sent();
                        return [2, new bignumber_js_1.default(gasPrice).div(Math.pow(10, 18))];
                }
            });
        });
    };
    Web3Public.prototype.getGasFee = function (gasLimit, etherPrice) {
        return __awaiter(this, void 0, void 0, function () {
            var gasPrice;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.getGasPriceInETH()];
                    case 1:
                        gasPrice = _a.sent();
                        return [2, gasPrice.multipliedBy(gasLimit).multipliedBy(etherPrice)];
                }
            });
        });
    };
    Web3Public.prototype.getAllowance = function (tokenAddress, ownerAddress, spenderAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var contract, allowance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        contract = new this.web3.eth.Contract(erc_20_abi_1.default, tokenAddress);
                        return [4, contract.methods
                                .allowance(ownerAddress, spenderAddress)
                                .call({ from: ownerAddress })];
                    case 1:
                        allowance = _a.sent();
                        return [2, new bignumber_js_1.default(allowance)];
                }
            });
        });
    };
    Web3Public.prototype.getTransactionGasFee = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, receipt, gasPrice, gasLimit;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.getTransactionByHash(hash)];
                    case 1:
                        transaction = _a.sent();
                        return [4, this.web3.eth.getTransactionReceipt(hash)];
                    case 2:
                        receipt = _a.sent();
                        if (!transaction || !receipt) {
                            return [2, null];
                        }
                        gasPrice = new bignumber_js_1.default(transaction.gasPrice);
                        gasLimit = new bignumber_js_1.default(receipt.gasUsed);
                        return [2, gasPrice.multipliedBy(gasLimit)];
                }
            });
        });
    };
    Web3Public.prototype.getTransactionByHash = function (hash, attempt, attemptsLimit, delay) {
        return __awaiter(this, void 0, void 0, function () {
            var limit, timeoutMs, transaction;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        attempt = attempt || 0;
                        limit = attemptsLimit || 10;
                        timeoutMs = delay || 500;
                        if (attempt >= limit) {
                            return [2, null];
                        }
                        return [4, this.web3.eth.getTransaction(hash)];
                    case 1:
                        transaction = _a.sent();
                        if (transaction === null) {
                            return [2, new Promise(function (resolve) {
                                    return setTimeout(function () { return resolve(_this.getTransactionByHash(hash, attempt + 1)); }, timeoutMs);
                                })];
                        }
                        return [2, transaction];
                }
            });
        });
    };
    Web3Public.prototype.callContractMethod = function (contractAddress, contractAbi, methodName, options) {
        if (options === void 0) { options = { methodArguments: [] }; }
        return __awaiter(this, void 0, void 0, function () {
            var contract;
            var _a;
            return __generator(this, function (_b) {
                contract = new this.web3.eth.Contract(contractAbi, contractAddress);
                return [2, (_a = contract.methods)[methodName].apply(_a, options.methodArguments).call(__assign({}, (options.from && { from: options.from })))];
            });
        });
    };
    Web3Public.prototype.getTokensBalances = function (address, tokensAddresses) {
        return __awaiter(this, void 0, void 0, function () {
            var contract, indexOfNativeCoin, promises, calls, results, tokensBalances;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        contract = new this.web3.eth.Contract(erc_20_abi_1.default, tokensAddresses[0]);
                        indexOfNativeCoin = tokensAddresses.findIndex(Web3Public.isNativeAddress);
                        promises = [];
                        if (indexOfNativeCoin !== -1) {
                            tokensAddresses.splice(indexOfNativeCoin, 1);
                            promises[1] = this.getBalance(address);
                        }
                        calls = tokensAddresses.map(function (tokenAddress) { return ({
                            target: tokenAddress,
                            callData: contract.methods.balanceOf(address).encodeABI()
                        }); });
                        promises[0] = this.multicall(calls);
                        return [4, Promise.all(promises)];
                    case 1:
                        results = _a.sent();
                        tokensBalances = results[0].map(function (_a) {
                            var success = _a.success, returnData = _a.returnData;
                            return success ? new bignumber_js_1.default(returnData) : new bignumber_js_1.default(0);
                        });
                        if (indexOfNativeCoin !== -1) {
                            tokensBalances.splice(indexOfNativeCoin, 0, results[1]);
                        }
                        return [2, tokensBalances];
                }
            });
        });
    };
    Web3Public.prototype.multicallContractMethod = function (contractAddress, contractAbi, methodName, methodCallsArguments) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var contract, calls, outputs, methodOutputAbi;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        contract = new this.web3.eth.Contract(contractAbi, contractAddress);
                        calls = methodCallsArguments.map(function (callArguments) {
                            var _a;
                            return ({
                                callData: (_a = contract.methods)[methodName].apply(_a, callArguments).encodeABI(),
                                target: contractAddress
                            });
                        });
                        return [4, this.multicall(calls)];
                    case 1:
                        outputs = _b.sent();
                        methodOutputAbi = (_a = contractAbi.find(function (funcSignature) { return funcSignature.name === methodName; })) === null || _a === void 0 ? void 0 : _a.outputs;
                        if (!methodOutputAbi) {
                            throw new rubic_error_1.RubicError("Contract method " + methodName + " does not exist.");
                        }
                        return [2, outputs.map(function (output) { return ({
                                success: output.success,
                                output: output.success
                                    ? _this.web3.eth.abi.decodeParameters(methodOutputAbi, output.returnData)
                                    : null
                            }); })];
                }
            });
        });
    };
    Web3Public.prototype.checkBalance = function (token, amount, userAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var balance, amountAbsolute;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!Web3Public.isNativeAddress(token.address)) return [3, 2];
                        return [4, this.getBalance(userAddress)];
                    case 1:
                        balance = _a.sent();
                        return [3, 4];
                    case 2: return [4, this.getTokenBalance(userAddress, token.address)];
                    case 3:
                        balance = _a.sent();
                        _a.label = 4;
                    case 4:
                        amountAbsolute = Web3Public.toWei(amount, token.decimals);
                        if (balance.lt(amountAbsolute)) {
                            throw new insufficient_funds_error_1.InsufficientFundsError(amount.toFixed(0));
                        }
                        return [2];
                }
            });
        });
    };
    Web3Public.prototype.batchEstimatedGas = function (abi, contractAddress, fromAddress, callsData) {
        return __awaiter(this, void 0, void 0, function () {
            var contract_1, dataList, rpcCallsData, result, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        contract_1 = new this.web3.eth.Contract(abi, contractAddress);
                        dataList = callsData.map(function (callData) {
                            var _a;
                            return (_a = contract_1.methods)[callData.contractMethod].apply(_a, callData.params).encodeABI();
                        });
                        rpcCallsData = dataList.map(function (data, index) { return ({
                            rpcMethod: 'eth_estimateGas',
                            params: __assign({ from: fromAddress, to: contractAddress, data: data }, (callsData[index].value && {
                                value: "0x" + callsData[index].value.toString(16)
                            }))
                        }); });
                        return [4, this.rpcBatchRequest(rpcCallsData)];
                    case 1:
                        result = _a.sent();
                        return [2, result.map(function (value) { return (value ? new bignumber_js_1.default(value) : null); })];
                    case 2:
                        e_1 = _a.sent();
                        console.error(e_1);
                        return [2, callsData.map(function () { return null; })];
                    case 3: return [2];
                }
            });
        });
    };
    Web3Public.prototype.web3BatchRequest = function (calls, callsParams) {
        var batch = new this.web3.BatchRequest();
        var promises = calls.map(function (call, index) {
            return new Promise(function (resolve, reject) {
                return batch.add(call.request(__assign({}, callsParams[index]), function (error, result) {
                    return error ? reject(error) : resolve(result);
                }));
            });
        });
        batch.execute();
        return Promise.all(promises);
    };
    Web3Public.prototype.rpcBatchRequest = function (rpcCallsData) {
        return __awaiter(this, void 0, void 0, function () {
            var seed, batch, httpClient, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        seed = Date.now();
                        batch = rpcCallsData.map(function (callData, index) { return ({
                            id: seed + index,
                            jsonrpc: '2.0',
                            method: callData.rpcMethod,
                            params: [__assign({}, callData.params)]
                        }); });
                        return [4, this.getHttpClient()];
                    case 1:
                        httpClient = _a.sent();
                        return [4, httpClient.post(this.web3.currentProvider.host, batch)];
                    case 2:
                        response = _a.sent();
                        return [2, response.sort(function (a, b) { return a.id - b.id; }).map(function (item) { return (item.error ? null : item.result); })];
                }
            });
        });
    };
    Web3Public.prototype.multicall = function (calls) {
        return __awaiter(this, void 0, void 0, function () {
            var contract;
            return __generator(this, function (_a) {
                contract = new this.web3.eth.Contract(multicall_abi_1.MULTICALL_ABI, this.multicallAddresses[this.blockchain.name]);
                return [2, contract.methods.tryAggregate(false, calls).call()];
            });
        });
    };
    Web3Public.prototype.getHttpClient = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!this.httpClient) return [3, 2];
                        _a = this;
                        return [4, Promise.resolve().then(function () { return __importStar(require('axios')); })];
                    case 1:
                        _a.httpClient = (_b.sent());
                        _b.label = 2;
                    case 2: return [2, this.httpClient];
                }
            });
        });
    };
    Web3Public.isNativeAddress = function (address) {
        return address === native_token_address_1.NATIVE_TOKEN_ADDRESS;
    };
    return Web3Public;
}());
exports.Web3Public = Web3Public;
//# sourceMappingURL=web3-public.js.map