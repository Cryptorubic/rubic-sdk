"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Web3Pure = void 0;
var rubic_sdk_error_1 = require("../../../common/errors/rubic-sdk.error");
var native_token_address_1 = require("../constants/native-token-address");
var bignumber_js_1 = __importDefault(require("bignumber.js"));
var web3_1 = __importDefault(require("web3"));
var web3_utils_1 = require("web3-utils");
var Web3Pure = /** @class */ (function () {
    function Web3Pure() {
    }
    Object.defineProperty(Web3Pure, "nativeTokenAddress", {
        /**
         * @description gets address of native coin {@link NATIVE_TOKEN_ADDRESS}
         */
        get: function () {
            return native_token_address_1.NATIVE_TOKEN_ADDRESS;
        },
        enumerable: false,
        configurable: true
    });
    Web3Pure.isZeroAddress = function (address) {
        return address === this.ZERO_ADDRESS;
    };
    /**
     * Increases the gas limit value by the specified percentage and rounds to the nearest integer.
     * @param gasLimit Gas limit value to increase.
     * @param multiplier The multiplier by which the gas limit will be increased.
     */
    Web3Pure.calculateGasMargin = function (gasLimit, multiplier) {
        return new bignumber_js_1.default(gasLimit || '0').multipliedBy(multiplier);
    };
    /**
     * @description convert amount from Ether to Wei units
     * @param amount amount to convert
     * @param [decimals=18] token decimals
     */
    Web3Pure.toWei = function (amount, decimals) {
        if (decimals === void 0) { decimals = 18; }
        return new bignumber_js_1.default(amount || 0).times(new bignumber_js_1.default(10).pow(decimals)).toFixed(0);
    };
    /**
     * @description convert amount from Wei to Ether units
     * @param amountInWei amount to convert
     * @param [decimals=18] token decimals
     */
    Web3Pure.fromWei = function (amountInWei, decimals) {
        if (decimals === void 0) { decimals = 18; }
        return new bignumber_js_1.default(amountInWei).div(new bignumber_js_1.default(10).pow(decimals));
    };
    /**
     * @description convert address to bytes32 format
     * @param address address to convert
     */
    Web3Pure.addressToBytes32 = function (address) {
        if (address.slice(0, 2) !== '0x' || address.length !== 42) {
            console.error('Wrong address format');
            throw new rubic_sdk_error_1.RubicSdkError('Wrong address format');
        }
        return "0x".concat(address.slice(2).padStart(64, '0'));
    };
    /**
     * @description convert address to checksum format
     * @param address address to convert
     */
    Web3Pure.toChecksumAddress = function (address) {
        return (0, web3_utils_1.toChecksumAddress)(address);
    };
    /**
     * @description checks if a given address is a valid Ethereum address
     * @param address the address to check validity
     */
    Web3Pure.isAddressCorrect = function (address) {
        return (0, web3_utils_1.isAddress)(address);
    };
    /**
     * @description converts Eth amount into Wei
     * @param value to convert in Eth
     */
    Web3Pure.ethToWei = function (value) {
        return (0, web3_utils_1.toWei)(value.toString(), 'ether');
    };
    /**
     * @description converts Wei amount into Eth
     * @param value to convert in Wei
     */
    Web3Pure.weiToEth = function (value) {
        return (0, web3_utils_1.fromWei)(value.toString(), 'ether');
    };
    Web3Pure.encodeMethodCall = function (contractAddress, contractAbi, method, parameters, value, options) {
        var _a;
        if (parameters === void 0) { parameters = []; }
        if (options === void 0) { options = {}; }
        var contract = new this.web3Eth.Contract(contractAbi);
        var data = (_a = contract.methods)[method].apply(_a, parameters).encodeABI();
        return {
            to: contractAddress,
            data: data,
            value: value,
            gas: options.gas,
            gasPrice: options.gasPrice
        };
    };
    /**
     * Encodes a function call using its JSON interface object and given parameters.
     * @param contractAbi The JSON interface object of a function.
     * @param methodName Method name to encode.
     * @param methodArguments Parameters to encode.
     * @return string An ABI encoded function call. Means function signature + parameters.
     */
    Web3Pure.encodeFunctionCall = function (contractAbi, methodName, methodArguments) {
        var methodSignature = contractAbi.find(function (abiItem) { return abiItem.name === methodName; });
        if (methodSignature === undefined) {
            throw Error('No such method in abi');
        }
        return this.web3Eth.abi.encodeFunctionCall(methodSignature, methodArguments);
    };
    Web3Pure.ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
    Web3Pure.web3Eth = new web3_1.default().eth;
    /**
     * @description checks if address is Ether native address
     * @param address address to check
     */
    Web3Pure.isNativeAddress = function (address) {
        return address === native_token_address_1.NATIVE_TOKEN_ADDRESS;
    };
    return Web3Pure;
}());
exports.Web3Pure = Web3Pure;
//# sourceMappingURL=web3-pure.js.map