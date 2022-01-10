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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var cache_decorator_1 = require("../../../common/decorators/cache.decorator");
var healthcheck_error_1 = require("../../../common/errors/blockchain/healthcheck.error");
var erc_20_abi_1 = require("../constants/erc-20-abi");
var healthcheck_1 = require("../constants/healthcheck");
var native_tokens_1 = require("../constants/native-tokens");
var multicall_abi_1 = require("./constants/multicall-abi");
var multicall_addresses_1 = require("./constants/multicall-addresses");
var web3_pure_1 = require("../web3-pure/web3-pure");
var p_timeout_1 = __importStar(require("p-timeout"));
var bignumber_js_1 = __importDefault(require("bignumber.js"));
var insufficient_funds_error_1 = require("../../../common/errors/swap/insufficient-funds.error");
var default_http_client_1 = require("../../../common/http/default-http-client");
/**
 * Class containing methods for calling contracts in order to obtain information from the blockchain.
 * To send transaction or execute contract method use {@link Web3Private}.
 */
var Web3Public = /** @class */ (function () {
    /**
     * @param web3 web3 instance initialized with ethereum provider, e.g. rpc link
     * @param blockchainName blockchain in which you need to execute requests
     * @param [httpClient=axios] http client that implements {@link HttpClient} interface
     */
    function Web3Public(web3, blockchainName, httpClient) {
        this.web3 = web3;
        this.blockchainName = blockchainName;
        this.httpClient = httpClient;
        this.multicallAddresses = multicall_addresses_1.MULTICALL_ADDRESSES;
        this.clearController = { clear: false };
    }
    /**
     * HealthCheck current rpc node
     * @param timeoutMs acceptable node response timeout
     * @return null if healthcheck is not defined for current blockchain, else is node works status
     */
    Web3Public.prototype.healthCheck = function (timeoutMs) {
        if (timeoutMs === void 0) { timeoutMs = 4000; }
        return __awaiter(this, void 0, void 0, function () {
            var healthcheckData, contract, result, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(0, healthcheck_1.isBlockchainHealthcheckAvailable)(this.blockchainName)) {
                            return [2 /*return*/, true];
                        }
                        healthcheckData = healthcheck_1.HEALTHCHECK[this.blockchainName];
                        contract = new this.web3.eth.Contract(healthcheckData.contractAbi, healthcheckData.contractAddress);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, p_timeout_1.default)(contract.methods[healthcheckData.method]().call(), timeoutMs)];
                    case 2:
                        result = _a.sent();
                        if (result !== healthcheckData.expected) {
                            throw new healthcheck_error_1.HealthcheckError();
                        }
                        return [2 /*return*/, true];
                    case 3:
                        e_1 = _a.sent();
                        if (e_1 instanceof p_timeout_1.TimeoutError) {
                            console.debug("".concat(this.blockchainName, " node healthcheck timeout (").concat(timeoutMs, "ms) has occurred."));
                        }
                        else {
                            console.debug("".concat(this.blockchainName, " node healthcheck fail: ").concat(e_1));
                        }
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @description set new provider to web3 instance
     * @param provider new web3 provider, e.g. rpc link
     */
    Web3Public.prototype.setProvider = function (provider) {
        this.web3.setProvider(provider);
    };
    /**
     * @description gets block by blockId
     * @param [blockId] block id: hash, number ... Default is 'latest'.
     * @returns {BlockTransactionString} block by blockId parameter.
     */
    Web3Public.prototype.getBlock = function (blockId) {
        if (blockId === void 0) { blockId = 'latest'; }
        return this.web3.eth.getBlock(blockId);
    };
    /**
     * @description gets account eth or token balance as integer (multiplied to 10 ** decimals)
     * @param address wallet address whose balance you want to find out
     * @param [tokenAddress] address of the smart-contract corresponding to the token, or {@link NATIVE_TOKEN_ADDRESS}.
     * If not passed the balance in the native currency will be returned.
     * @returns address eth or token balance as integer (multiplied to 10 ** decimals)
     */
    Web3Public.prototype.getBalance = function (address, tokenAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var balance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(tokenAddress && !web3_pure_1.Web3Pure.isNativeAddress(tokenAddress))) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getTokenBalance(address, tokenAddress)];
                    case 1:
                        balance = _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.web3.eth.getBalance(address)];
                    case 3:
                        balance = _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/, new bignumber_js_1.default(balance)];
                }
            });
        });
    };
    /**
     * @description gets ERC-20 tokens balance as integer (multiplied to 10 ** decimals)
     * @param tokenAddress address of the smart-contract corresponding to the token
     * @param address wallet address whose balance you want to find out
     * @returns address tokens balance as integer (multiplied to 10 ** decimals)
     */
    Web3Public.prototype.getTokenBalance = function (address, tokenAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var contract, balance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        contract = new this.web3.eth.Contract(erc_20_abi_1.ERC20_TOKEN_ABI, tokenAddress);
                        return [4 /*yield*/, contract.methods.balanceOf(address).call()];
                    case 1:
                        balance = _a.sent();
                        return [2 /*return*/, new bignumber_js_1.default(balance)];
                }
            });
        });
    };
    /**
     * @description predicts the volume of gas required to execute the contract method
     * @param contractAbi abi of smart-contract
     * @param contractAddress address of smart-contract
     * @param methodName method whose execution gas number is to be calculated
     * @param methodArguments arguments of the executed contract method
     * @param fromAddress the address for which the gas calculation will be called
     * @param [value] The value transferred for the call “transaction” in wei.
     * @return The gas amount estimated
     */
    Web3Public.prototype.getEstimatedGas = function (contractAbi, contractAddress, methodName, methodArguments, fromAddress, value) {
        return __awaiter(this, void 0, void 0, function () {
            var contract, gasLimit, err_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        contract = new this.web3.eth.Contract(contractAbi, contractAddress);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (_a = contract.methods)[methodName].apply(_a, methodArguments).estimateGas(__assign({ from: fromAddress, gas: 10000000 }, (value && { value: value })))];
                    case 2:
                        gasLimit = _b.sent();
                        return [2 /*return*/, new bignumber_js_1.default(gasLimit)];
                    case 3:
                        err_1 = _b.sent();
                        console.debug(err_1);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @description calculates the average price per unit of gas according to web3
     * @return average gas price in Wei
     */
    Web3Public.prototype.getGasPrice = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.web3.eth.getGasPrice()];
            });
        });
    };
    /**
     * @description calculates the average price per unit of gas according to web3
     * @return average gas price in ETH
     */
    Web3Public.prototype.getGasPriceInETH = function () {
        return __awaiter(this, void 0, void 0, function () {
            var gasPrice;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.web3.eth.getGasPrice()];
                    case 1:
                        gasPrice = _a.sent();
                        return [2 /*return*/, new bignumber_js_1.default(gasPrice).div(Math.pow(10, 18))];
                }
            });
        });
    };
    /**
     * @description calculates the gas fee using average price per unit of gas according to web3 and Eth price according to coingecko
     * @param gasLimit gas limit
     * @param etherPrice price of Eth unit
     * @return gas fee in usd$
     */
    Web3Public.prototype.getGasFee = function (gasLimit, etherPrice) {
        return __awaiter(this, void 0, void 0, function () {
            var gasPrice;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getGasPriceInETH()];
                    case 1:
                        gasPrice = _a.sent();
                        return [2 /*return*/, gasPrice.multipliedBy(gasLimit).multipliedBy(etherPrice)];
                }
            });
        });
    };
    /**
     * @description executes allowance method in ERC-20 token contract
     * @param tokenAddress address of the smart-contract corresponding to the token
     * @param spenderAddress wallet or contract address, allowed to spend
     * @param ownerAddress wallet address to spend from
     * @return tokens amount, allowed to be spent
     */
    Web3Public.prototype.getAllowance = function (tokenAddress, ownerAddress, spenderAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var contract, allowance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        contract = new this.web3.eth.Contract(erc_20_abi_1.ERC20_TOKEN_ABI, tokenAddress);
                        return [4 /*yield*/, contract.methods
                                .allowance(ownerAddress, spenderAddress)
                                .call({ from: ownerAddress })];
                    case 1:
                        allowance = _a.sent();
                        return [2 /*return*/, new bignumber_js_1.default(allowance)];
                }
            });
        });
    };
    /**
     * @description gets mined transaction gas fee in Ether
     * @param hash transaction hash
     * @return transaction gas fee in Wei or null if transaction is not mined
     */
    Web3Public.prototype.getTransactionGasFee = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, receipt, gasPrice, gasLimit;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getTransactionByHash(hash)];
                    case 1:
                        transaction = _a.sent();
                        return [4 /*yield*/, this.web3.eth.getTransactionReceipt(hash)];
                    case 2:
                        receipt = _a.sent();
                        if (!transaction || !receipt) {
                            return [2 /*return*/, null];
                        }
                        gasPrice = new bignumber_js_1.default(transaction.gasPrice);
                        gasLimit = new bignumber_js_1.default(receipt.gasUsed);
                        return [2 /*return*/, gasPrice.multipliedBy(gasLimit)];
                }
            });
        });
    };
    /**
     * @description get a transaction by hash in several attempts
     * @param hash hash of the target transaction
     * @param attempt current attempt number
     * @param attemptsLimit maximum allowed number of attempts
     * @param delay ms delay before next attempt
     */
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
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, this.web3.eth.getTransaction(hash)];
                    case 1:
                        transaction = _a.sent();
                        if (transaction === null) {
                            return [2 /*return*/, new Promise(function (resolve) {
                                    return setTimeout(function () { return resolve(_this.getTransactionByHash(hash, attempt + 1)); }, timeoutMs);
                                })];
                        }
                        return [2 /*return*/, transaction];
                }
            });
        });
    };
    /**
     * @description call smart-contract pure method of smart-contract and returns its output value
     * @param contractAddress address of smart-contract which method is to be executed
     * @param contractAbi abi of smart-contract which method is to be executed
     * @param methodName calling method name
     * @param [options] additional options
     * @param [options.from] the address the call “transaction” should be made from
     * @param [options.methodArguments] executing method arguments
     * @return smart-contract pure method returned value
     */
    Web3Public.prototype.callContractMethod = function (contractAddress, contractAbi, methodName, options) {
        if (options === void 0) { options = { methodArguments: [] }; }
        return __awaiter(this, void 0, void 0, function () {
            var contract;
            var _a;
            return __generator(this, function (_b) {
                contract = new this.web3.eth.Contract(contractAbi, contractAddress);
                return [2 /*return*/, (_a = contract.methods)[methodName].apply(_a, options.methodArguments).call(__assign(__assign({}, (options.from && { from: options.from })), (options.value && { value: options.value })))];
            });
        });
    };
    /**
     * @description get balance of multiple tokens via multicall
     * @param address wallet address
     * @param tokensAddresses tokens addresses
     */
    Web3Public.prototype.getTokensBalances = function (address, tokensAddresses) {
        return __awaiter(this, void 0, void 0, function () {
            var contract, indexOfNativeCoin, promises, calls, results, tokensBalances;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        contract = new this.web3.eth.Contract(erc_20_abi_1.ERC20_TOKEN_ABI, tokensAddresses[0]);
                        indexOfNativeCoin = tokensAddresses.findIndex(web3_pure_1.Web3Pure.isNativeAddress);
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
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        results = _a.sent();
                        tokensBalances = results[0].map(function (_a) {
                            var success = _a.success, returnData = _a.returnData;
                            return success ? new bignumber_js_1.default(returnData) : new bignumber_js_1.default(0);
                        });
                        if (indexOfNativeCoin !== -1) {
                            tokensBalances.splice(indexOfNativeCoin, 0, results[1]);
                        }
                        return [2 /*return*/, tokensBalances];
                }
            });
        });
    };
    /**
     * Uses multicall to make several calls of one method in one contract.
     * @param contractAddress Target contract address.
     * @param contractAbi Target contract abi.
     * @param methodName target method name
     * @param methodCallsArguments list method calls parameters arrays
     */
    Web3Public.prototype.multicallContractMethod = function (contractAddress, contractAbi, methodName, methodCallsArguments) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.multicallContractMethods(contractAddress, contractAbi, methodCallsArguments.map(function (methodArguments) { return ({
                        methodName: methodName,
                        methodArguments: methodArguments
                    }); }))];
            });
        });
    };
    /**
     * Uses multicall to make several methods calls in one contract.
     * @param contractAddress Target contract address.
     * @param contractAbi Target contract abi.
     * @param methodsData Methods data, containing methods' names and arguments.
     */
    Web3Public.prototype.multicallContractMethods = function (contractAddress, contractAbi, methodsData) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.multicallContractsMethods(contractAbi, [
                            {
                                contractAddress: contractAddress,
                                methodsData: methodsData
                            }
                        ])];
                    case 1: return [2 /*return*/, (_a.sent())[0]];
                }
            });
        });
    };
    /**
     * Uses multicall to make many methods calls in several contracts.
     * @param contractAbi Target contract abi.
     * @param contractsData Contract addresses and methods data, containing methods' names and arguments.
     */
    Web3Public.prototype.multicallContractsMethods = function (contractAbi, contractsData) {
        return __awaiter(this, void 0, void 0, function () {
            var calls, outputs, outputIndex;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        calls = contractsData.map(function (_a) {
                            var contractAddress = _a.contractAddress, methodsData = _a.methodsData;
                            var contract = new _this.web3.eth.Contract(contractAbi, contractAddress);
                            return methodsData.map(function (_a) {
                                var _b;
                                var methodName = _a.methodName, methodArguments = _a.methodArguments;
                                return ({
                                    callData: (_b = contract.methods)[methodName].apply(_b, methodArguments).encodeABI(),
                                    target: contractAddress
                                });
                            });
                        });
                        return [4 /*yield*/, this.multicall(calls.flat())];
                    case 1:
                        outputs = _a.sent();
                        outputIndex = 0;
                        return [2 /*return*/, contractsData.map(function (contractData) {
                                return contractData.methodsData.map(function (methodData) {
                                    var methodOutputAbi = contractAbi.find(function (funcSignature) { return funcSignature.name === methodData.methodName; }).outputs;
                                    var output = outputs[outputIndex];
                                    outputIndex++;
                                    return {
                                        success: output.success,
                                        output: output.success
                                            ? _this.web3.eth.abi.decodeParameters(methodOutputAbi, output.returnData)
                                            : null
                                    };
                                });
                            })];
                }
            });
        });
    };
    /**
     * @description Checks if the specified address contains the required amount of these tokens.
     * Throws an InsufficientFundsError if the balance is insufficient
     * @param token token balance for which you need to check
     * @param amount required balance
     * @param userAddress the address where the required balance should be
     */
    Web3Public.prototype.checkBalance = function (token, amount, userAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var balance, amountAbsolute;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!web3_pure_1.Web3Pure.isNativeAddress(token.address)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getBalance(userAddress)];
                    case 1:
                        balance = _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.getTokenBalance(userAddress, token.address)];
                    case 3:
                        balance = _a.sent();
                        _a.label = 4;
                    case 4:
                        amountAbsolute = web3_pure_1.Web3Pure.toWei(amount, token.decimals);
                        if (balance.lt(amountAbsolute)) {
                            throw new insufficient_funds_error_1.InsufficientFundsError(amount.toFixed(0));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Gets ERC-20 token info by address.
     * @param tokenAddress Address of token.
     * @param tokenFields Token's fields to get.
     */
    Web3Public.prototype.callForTokenInfo = function (tokenAddress, tokenFields) {
        if (tokenFields === void 0) { tokenFields = ['decimals', 'symbol', 'name']; }
        return __awaiter(this, void 0, void 0, function () {
            var nativeToken, tokenFieldsPromises, tokenFieldsResults;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (web3_pure_1.Web3Pure.isNativeAddress(tokenAddress)) {
                            nativeToken = native_tokens_1.nativeTokensList[this.blockchainName];
                            return [2 /*return*/, __assign(__assign({}, nativeToken), { decimals: nativeToken.decimals.toString() })];
                        }
                        tokenFieldsPromises = tokenFields.map(function (method) {
                            return _this.callContractMethod(tokenAddress, erc_20_abi_1.ERC20_TOKEN_ABI, method);
                        });
                        return [4 /*yield*/, Promise.all(tokenFieldsPromises)];
                    case 1:
                        tokenFieldsResults = _a.sent();
                        return [2 /*return*/, tokenFieldsResults.reduce(function (acc, field, index) {
                                var _a;
                                return (__assign(__assign({}, acc), (_a = {}, _a[tokenFields[index]] = field, _a)));
                            }, {})];
                }
            });
        });
    };
    /**
     * Gets ERC-20 tokens info by addresses.
     * @param tokenAddresses Addresses of tokens.
     */
    Web3Public.prototype.callForTokensInfo = function (tokenAddresses) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenFields, contractsData, results, notSave, tokensInfo, conditionalReturns;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tokenFields = ['decimals', 'symbol', 'name'];
                        contractsData = tokenAddresses.map(function (contractAddress) { return ({
                            contractAddress: contractAddress,
                            methodsData: tokenFields.map(function (methodName) { return ({
                                methodName: methodName,
                                methodArguments: []
                            }); })
                        }); });
                        return [4 /*yield*/, this.multicallContractsMethods(erc_20_abi_1.ERC20_TOKEN_ABI, contractsData)];
                    case 1:
                        results = _a.sent();
                        notSave = false;
                        tokensInfo = results.map(function (contractCallResult) {
                            var token = {};
                            contractCallResult.forEach(function (field, index) {
                                var _a;
                                token[tokenFields[index]] = field.success
                                    ? (_a = field.output) === null || _a === void 0 ? void 0 : _a[0]
                                    : undefined;
                                if (!field.success) {
                                    notSave = true;
                                }
                            });
                            return token;
                        });
                        conditionalReturns = {
                            notSave: notSave,
                            value: tokensInfo
                        };
                        // see https://github.com/microsoft/TypeScript/issues/4881
                        // @ts-ignore
                        return [2 /*return*/, conditionalReturns];
                }
            });
        });
    };
    /**
     * @description get estimated gas of several contract method execution via rpc batch request
     * @param abi contract ABI
     * @param contractAddress contract address
     * @param fromAddress sender address
     * @param callsData transactions parameters
     * @returns list of contract execution estimated gases.
     * if the execution of the method in the real blockchain would not be reverted,
     * then the list item would be equal to the predicted gas limit.
     * Else (if you have not enough balance, allowance ...) then the list item would be equal to null
     */
    Web3Public.prototype.batchEstimatedGas = function (abi, contractAddress, fromAddress, callsData) {
        return __awaiter(this, void 0, void 0, function () {
            var contract_1, dataList, rpcCallsData, result, e_2;
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
                                value: "0x".concat(parseInt(callsData[index].value).toString(16))
                            }))
                        }); });
                        return [4 /*yield*/, this.rpcBatchRequest(rpcCallsData)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.map(function (value) { return (value ? new bignumber_js_1.default(value) : null); })];
                    case 2:
                        e_2 = _a.sent();
                        console.error(e_2);
                        return [2 /*return*/, callsData.map(function () { return null; })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @description send batch request via web3
     * @see {@link https://web3js.readthedocs.io/en/v1.3.0/web3-eth.html#batchrequest|Web3BatchRequest}
     * @param calls Web3 method calls
     * @param callsParams ethereum method transaction parameters
     * @returns batch request call result sorted in order of input parameters
     */
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
    /**
     * @description send batch request to rpc provider directly
     * @see {@link https://playground.open-rpc.org/?schemaUrl=https://raw.githubusercontent.com/ethereum/eth1.0-apis/assembled-spec/openrpc.json&uiSchema%5BappBar%5D%5Bui:splitView%5D=false&uiSchema%5BappBar%5D%5Bui:input%5D=false&uiSchema%5BappBar%5D%5Bui:examplesDropdown%5D=false|EthereumJSON-RPC}
     * @param rpcCallsData rpc methods and parameters list
     * @returns rpc batch request call result sorted in order of input 1parameters
     */
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
                        return [4 /*yield*/, this.getHttpClient()];
                    case 1:
                        httpClient = _a.sent();
                        return [4 /*yield*/, httpClient.post(this.web3.currentProvider.host, batch)];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response.sort(function (a, b) { return a.id - b.id; }).map(function (item) { return (item.error ? null : item.result); })];
                }
            });
        });
    };
    /**
     * @description execute multiplie calls in the single contract call
     * @param calls multicall calls data list
     * @return result of calls execution
     */
    Web3Public.prototype.multicall = function (calls) {
        return __awaiter(this, void 0, void 0, function () {
            var contract;
            return __generator(this, function (_a) {
                contract = new this.web3.eth.Contract(multicall_abi_1.MULTICALL_ABI, this.multicallAddresses[this.blockchainName]);
                return [2 /*return*/, contract.methods.tryAggregate(false, calls).call()];
            });
        });
    };
    /**
     * @description returns httpClient if it exists or imports the axios client
     */
    Web3Public.prototype.getHttpClient = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!this.httpClient) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, default_http_client_1.DefaultHttpClient.getInstance()];
                    case 1:
                        _a.httpClient = _b.sent();
                        _b.label = 2;
                    case 2: return [2 /*return*/, this.httpClient];
                }
            });
        });
    };
    __decorate([
        cache_decorator_1.Cache
    ], Web3Public.prototype, "callForTokenInfo", null);
    __decorate([
        (0, cache_decorator_1.Cache)({ conditionalCache: true })
    ], Web3Public.prototype, "callForTokensInfo", null);
    return Web3Public;
}());
exports.Web3Public = Web3Public;
//# sourceMappingURL=web3-public.js.map