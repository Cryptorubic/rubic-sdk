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
exports.Web3Private = void 0;
var erc_20_abi_1 = require("@core/blockchain/constants/erc-20-abi");
var bignumber_js_1 = __importDefault(require("bignumber.js"));
var low_gas_error_1 = require("@common/errors/low-gas-error");
var user_reject_error_1 = require("@common/errors/user-reject-error");
var transaction_reverted_error_1 = require("@common/errors/transaction-reverted-error");
var rubic_sdk_error_1 = require("@common/errors/rubic-sdk-error");
var FailedToCheckForTransactionReceiptError_1 = require("@common/errors/swap/FailedToCheckForTransactionReceiptError");
/**
 * Class containing methods for executing the functions of contracts and sending transactions in order to change the state of the blockchain.
 * To get information from the blockchain use {@link Web3Public}.
 */
var Web3Private = /** @class */ (function () {
    /**
     * @param walletConnectionConfiguration provider that implements {@link WalletConnectionConfiguration} interface.
     * The provider must contain an instance of web3, initialized with ethereum wallet, e.g. Metamask, WalletConnect
     */
    function Web3Private(walletConnectionConfiguration) {
        this.walletConnectionConfiguration = walletConnectionConfiguration;
        this.web3 = walletConnectionConfiguration.web3;
    }
    Object.defineProperty(Web3Private.prototype, "address", {
        /**
         * @description current wallet provider address
         */
        get: function () {
            return this.walletConnectionConfiguration.address;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Web3Private.prototype, "blockchainName", {
        /**
         * @description current wallet blockchainName
         */
        get: function () {
            return this.walletConnectionConfiguration.blockchainName;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * @description converts number, string or BigNumber value to integer string
     * @param amount value to convert
     */
    Web3Private.stringifyAmount = function (amount) {
        var bnAmount = new bignumber_js_1.default(amount);
        if (!bnAmount.isInteger()) {
            throw new rubic_sdk_error_1.RubicSdkError("Value " + amount + " is not integer");
        }
        return bnAmount.toFixed(0);
    };
    /**
     * @description parse web3 error by its code
     * @param err web3 error to parse
     */
    Web3Private.parseError = function (err) {
        if (err.message.includes('Transaction has been reverted by the EVM')) {
            return new transaction_reverted_error_1.TransactionRevertedError();
        }
        if (err.message.includes('Failed to check for transaction receipt')) {
            return new FailedToCheckForTransactionReceiptError_1.FailedToCheckForTransactionReceiptError();
        }
        if (err.code === -32603) {
            return new low_gas_error_1.LowGasError();
        }
        if (err.code === 4001) {
            return new user_reject_error_1.UserRejectError();
        }
        try {
            var errorMessage = JSON.parse(err.message.slice(24)).message;
            if (errorMessage) {
                return new Error(errorMessage);
            }
        }
        catch (_a) { }
        return err;
    };
    /**
     * @description sends ERC-20 tokens and resolve the promise when the transaction is included in the block
     * @param contractAddress address of the smart-contract corresponding to the token
     * @param toAddress token receiver address
     * @param amount integer tokens amount to send (pre-multiplied by 10 ** decimals)
     * @param [options] additional options
     * @param [options.onTransactionHash] callback to execute when transaction enters the mempool
     * @return transaction receipt
     */
    Web3Private.prototype.transferTokens = function (contractAddress, toAddress, amount, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var contract;
            var _this = this;
            return __generator(this, function (_a) {
                contract = new this.web3.eth.Contract(erc_20_abi_1.ERC20_TOKEN_ABI, contractAddress);
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        contract.methods
                            .transfer(toAddress, Web3Private.stringifyAmount(amount))
                            .send(__assign(__assign({ from: _this.address }, (options.gas && { gas: Web3Private.stringifyAmount(options.gas) })), (options.gasPrice && {
                            gasPrice: Web3Private.stringifyAmount(options.gasPrice)
                        })))
                            .on('transactionHash', options.onTransactionHash || (function () { }))
                            .on('receipt', resolve)
                            .on('error', function (err) {
                            console.error("Tokens transfer error. " + err);
                            reject(Web3Private.parseError(err));
                        });
                    })];
            });
        });
    };
    /**
     * @description sends ERC-20 tokens and resolve the promise without waiting for the transaction to be included in the block
     * @param contractAddress address of the smart-contract corresponding to the token
     * @param toAddress token receiver address
     * @param amount integer tokens amount to send (pre-multiplied by 10 ** decimals)
     * @param [options] additional options
     * @param [options.onTransactionHash] callback to execute when transaction enters the mempool
     * @return transaction hash
     */
    Web3Private.prototype.transferTokensWithOnHashResolve = function (contractAddress, toAddress, amount, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var contract;
            var _this = this;
            return __generator(this, function (_a) {
                contract = new this.web3.eth.Contract(erc_20_abi_1.ERC20_TOKEN_ABI, contractAddress);
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        contract.methods
                            .transfer(toAddress, Web3Private.stringifyAmount(amount))
                            .send(__assign(__assign({ from: _this.address }, (options.gas && { gas: Web3Private.stringifyAmount(options.gas) })), (options.gasPrice && {
                            gasPrice: Web3Private.stringifyAmount(options.gasPrice)
                        })))
                            .on('transactionHash', function (hash) { return resolve(hash); })
                            .on('error', function (err) {
                            console.error("Tokens transfer error. " + err);
                            reject(Web3Private.parseError(err));
                        });
                    })];
            });
        });
    };
    /**
     * @description tries to send Eth in transaction and resolve the promise when the transaction is included in the block or rejects the error
     * @param toAddress Eth receiver address
     * @param value amount in Eth units
     * @param [options] additional options
     * @param [options.onTransactionHash] callback to execute when transaction enters the mempool
     * @param [options.inWei = false] boolean flag for determining the input parameter "value" in Wei
     * @param [options.data] data for calling smart contract methods.
     *    Use this field only if you are receiving data from a third-party api.
     *    When manually calling contract methods, use executeContractMethod()
     * @param [options.gas] transaction gas limit in absolute gas units
     * @param [options.gasPrice] price of gas unit in wei
     * @return transaction receipt
     */
    Web3Private.prototype.trySendTransaction = function (toAddress, value, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.web3.eth.call(__assign(__assign(__assign({ from: this.address, to: toAddress, value: Web3Private.stringifyAmount(value) }, (options.gas && { gas: Web3Private.stringifyAmount(options.gas) })), (options.gasPrice && {
                                gasPrice: Web3Private.stringifyAmount(options.gasPrice)
                            })), (options.data && { data: options.data })))];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.sendTransaction(toAddress, value, options)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        err_1 = _a.sent();
                        console.error("Tokens transfer error. " + err_1);
                        throw Web3Private.parseError(err_1);
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @description sends Eth in transaction and resolve the promise when the transaction is included in the block
     * @param toAddress Eth receiver address
     * @param value amount in Eth units
     * @param [options] additional options
     * @param [options.onTransactionHash] callback to execute when transaction enters the mempool
     * @param [options.inWei = false] boolean flag for determining the input parameter "value" in Wei
     * @param [options.data] data for calling smart contract methods.
     *    Use this field only if you are receiving data from a third-party api.
     *    When manually calling contract methods, use executeContractMethod()
     * @param [options.gas] transaction gas limit in absolute gas units
     * @param [options.gasPrice] price of gas unit in wei
     * @return transaction receipt
     */
    Web3Private.prototype.sendTransaction = function (toAddress, value, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.web3.eth
                            .sendTransaction(__assign(__assign(__assign({ from: _this.address, to: toAddress, value: Web3Private.stringifyAmount(value) }, (options.gas && { gas: Web3Private.stringifyAmount(options.gas) })), (options.gasPrice && {
                            gasPrice: Web3Private.stringifyAmount(options.gasPrice)
                        })), (options.data && { data: options.data })))
                            .on('transactionHash', options.onTransactionHash || (function () { }))
                            .on('receipt', function (receipt) { return resolve(receipt); })
                            .on('error', function (err) {
                            console.error("Tokens transfer error. " + err);
                            reject(Web3Private.parseError(err));
                        });
                    })];
            });
        });
    };
    /**
     * @description sends Eth in transaction and resolve the promise without waiting for the transaction to be included in the block
     * @param toAddress Eth receiver address
     * @param value amount in Eth units
     * @param [options] additional options
     * @param [options.inWei = false] boolean flag for determining the input parameter "value" in Wei
     * @return transaction hash
     */
    Web3Private.prototype.sendTransactionWithOnHashResolve = function (toAddress, value, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.web3.eth
                            .sendTransaction(__assign(__assign(__assign({ from: _this.address, to: toAddress, value: Web3Private.stringifyAmount(value) }, (options.gas && { gas: Web3Private.stringifyAmount(options.gas) })), (options.gasPrice && {
                            gasPrice: Web3Private.stringifyAmount(options.gasPrice)
                        })), (options.data && { data: options.data })))
                            .on('transactionHash', function (hash) { return resolve(hash); })
                            .on('error', function (err) {
                            console.error("Tokens transfer error. " + err);
                            reject(Web3Private.parseError(err));
                        });
                    })];
            });
        });
    };
    /**
     * @description executes approve method in ERC-20 token contract
     * @param tokenAddress address of the smart-contract corresponding to the token
     * @param spenderAddress wallet or contract address to approve
     * @param value integer value to approve (pre-multiplied by 10 ** decimals)
     * @param [options] additional options
     * @param [options.onTransactionHash] callback to execute when transaction enters the mempool
     * @return approval transaction receipt
     */
    Web3Private.prototype.approveTokens = function (tokenAddress, spenderAddress, value, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var rawValue, contract;
            var _this = this;
            return __generator(this, function (_a) {
                if (value === 'infinity') {
                    rawValue = new bignumber_js_1.default(2).pow(256).minus(1);
                }
                else {
                    rawValue = value;
                }
                contract = new this.web3.eth.Contract(erc_20_abi_1.ERC20_TOKEN_ABI, tokenAddress);
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        contract.methods
                            .approve(spenderAddress, rawValue.toFixed(0))
                            .send(__assign(__assign({ from: _this.address }, (options.gas && { gas: Web3Private.stringifyAmount(options.gas) })), (options.gasPrice && {
                            gasPrice: Web3Private.stringifyAmount(options.gasPrice)
                        })))
                            .on('transactionHash', options.onTransactionHash || (function () { }))
                            .on('receipt', resolve)
                            .on('error', function (err) {
                            console.error("Tokens approve error. " + err);
                            reject(Web3Private.parseError(err));
                        });
                    })];
            });
        });
    };
    /**
     * @description tries to execute method of smart-contract and resolve the promise when the transaction is included in the block or rejects the error
     * @param contractAddress address of smart-contract which method is to be executed
     * @param contractAbi abi of smart-contract which method is to be executed
     * @param methodName executing method name
     * @param methodArguments executing method arguments
     * @param [options] additional options
     * @param [options.value] amount in Wei amount to be attached to the transaction
     * @param [options.gas] gas limit to be attached to the transaction
     * @param allowError Check error and decides to execute contact if it needed.
     */
    Web3Private.prototype.tryExecuteContractMethod = function (contractAddress, contractAbi, methodName, methodArguments, options, allowError) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var contract, err_2;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        contract = new this.web3.eth.Contract(contractAbi, contractAddress);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, (_a = contract.methods)[methodName].apply(_a, methodArguments).call(__assign(__assign(__assign({ from: this.address }, (options.value && { value: Web3Private.stringifyAmount(options.value) })), (options.gas && { gas: Web3Private.stringifyAmount(options.gas) })), (options.gasPrice && {
                                gasPrice: Web3Private.stringifyAmount(options.gasPrice)
                            })))];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, this.executeContractMethod(contractAddress, contractAbi, methodName, methodArguments, options)];
                    case 3: return [2 /*return*/, _b.sent()];
                    case 4:
                        err_2 = _b.sent();
                        if (allowError && allowError(err_2)) {
                            return [2 /*return*/, this.executeContractMethod(contractAddress, contractAbi, methodName, methodArguments, options)];
                        }
                        console.error('Method execution error: ', err_2);
                        throw Web3Private.parseError(err_2);
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @description executes method of smart-contract and resolve the promise when the transaction is included in the block
     * @param contractAddress address of smart-contract which method is to be executed
     * @param contractAbi abi of smart-contract which method is to be executed
     * @param methodName executing method name
     * @param methodArguments executing method arguments
     * @param [options] additional options
     * @param [options.onTransactionHash] callback to execute when transaction enters the mempool
     * @param [options.value] amount in Wei amount to be attached to the transaction
     * @return smart-contract method returned value
     */
    Web3Private.prototype.executeContractMethod = function (contractAddress, contractAbi, methodName, methodArguments, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var contract;
            var _this = this;
            return __generator(this, function (_a) {
                contract = new this.web3.eth.Contract(contractAbi, contractAddress);
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var _a;
                        (_a = contract.methods)[methodName].apply(_a, methodArguments).send(__assign(__assign(__assign({ from: _this.address }, (options.value && {
                            value: Web3Private.stringifyAmount(options.value)
                        })), (options.gas && { gas: Web3Private.stringifyAmount(options.gas) })), (options.gasPrice && {
                            gasPrice: Web3Private.stringifyAmount(options.gasPrice)
                        })))
                            .on('transactionHash', options.onTransactionHash || (function () { }))
                            .on('receipt', resolve)
                            .on('error', function (err) {
                            console.error("Method execution error. " + err);
                            reject(Web3Private.parseError(err));
                        });
                    })];
            });
        });
    };
    /**
     * @description executes method of smart-contract and resolve the promise without waiting for the transaction to be included in the block
     * @param contractAddress address of smart-contract which method is to be executed
     * @param contractAbi abi of smart-contract which method is to be executed
     * @param methodName executing method name
     * @param methodArguments executing method arguments
     * @param [options] additional options
     * @param [options.onTransactionHash] callback to execute when transaction enters the mempool
     * @param [options.value] amount in Wei amount to be attached to the transaction
     * @return smart-contract method returned value
     */
    Web3Private.prototype.executeContractMethodWithOnHashResolve = function (contractAddress, contractAbi, methodName, methodArguments, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        var contract = new this.web3.eth.Contract(contractAbi, contractAddress);
        return new Promise(function (resolve, reject) {
            var _a;
            (_a = contract.methods)[methodName].apply(_a, methodArguments).send(__assign(__assign({ from: _this.address }, (options.gas && { gas: Web3Private.stringifyAmount(options.gas) })), (options.gasPrice && {
                gasPrice: Web3Private.stringifyAmount(options.gasPrice)
            })))
                .on('transactionHash', resolve)
                .on('error', function (err) {
                console.error("Tokens approve error. " + err);
                reject(Web3Private.parseError(err));
            });
        });
    };
    /**
     * @description removes approval for token use
     * @param tokenAddress tokenAddress address of the smart-contract corresponding to the token
     * @param spenderAddress wallet or contract address to approve
     */
    Web3Private.prototype.unApprove = function (tokenAddress, spenderAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.approveTokens(tokenAddress, spenderAddress, new bignumber_js_1.default(0))];
            });
        });
    };
    return Web3Private;
}());
exports.Web3Private = Web3Private;
//# sourceMappingURL=web3-private.js.map