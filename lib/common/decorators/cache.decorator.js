"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PConditionalCache = exports.Cache = void 0;
var rubic_sdk_error_1 = require("../errors/rubic-sdk.error");
function generateKey() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return args.reduce(function (acc, arg) { return (Object(arg) === arg ? acc + JSON.stringify(arg) : acc + String(arg)); }, '');
}
function saveResult(storage, key, result, maxAge) {
    var validUntilTimestamp = maxAge ? Date.now() + maxAge : Infinity;
    storage.set(key, { validUntilTimestamp: validUntilTimestamp, value: result });
}
function buildGetterCacheDescriptor(propertyKey, _a) {
    var get = _a.get, enumerable = _a.enumerable;
    return {
        enumerable: enumerable,
        get: function () {
            var value = get.call(this);
            Object.defineProperty(this, propertyKey, {
                enumerable: enumerable,
                value: value
            });
            return value;
        }
    };
}
function modifyMethodCacheDescriptor(cacheConfig, descriptor) {
    var originalMethod = descriptor.value;
    var storage = new WeakMap();
    descriptor.value = function method() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!storage.has(this)) {
            storage.set(this, new Map());
        }
        var instanceStore = storage.get(this);
        var key = generateKey(args);
        if (instanceStore.has(key)) {
            var cacheItem = instanceStore.get(key);
            if (cacheItem.validUntilTimestamp > Date.now()) {
                return cacheItem.value;
            }
            instanceStore.delete(key);
        }
        var result = originalMethod.apply(this, args);
        if (cacheConfig.conditionalCache) {
            if (result instanceof Promise) {
                var handledPromise = result.then(function (resolved) {
                    if (resolved.notSave) {
                        instanceStore.delete(key);
                    }
                    return resolved.value;
                });
                saveResult(instanceStore, key, handledPromise, cacheConfig.maxAge);
                return handledPromise;
            }
            result = result;
            if (result.notSave) {
                instanceStore.delete(key);
            }
            else {
                saveResult(instanceStore, key, result.value, cacheConfig.maxAge);
            }
            return result.value;
        }
        saveResult(instanceStore, key, result, cacheConfig.maxAge);
        return result;
    };
    return descriptor;
}
function CacheBuilder(cacheConfig) {
    return function cacheBuilder(_, propertyKey, descriptor) {
        var get = descriptor.get, originalMethod = descriptor.value;
        if (get) {
            return buildGetterCacheDescriptor(propertyKey, {
                get: get,
                enumerable: descriptor.enumerable
            });
        }
        if (!originalMethod) {
            throw new rubic_sdk_error_1.RubicSdkError('Descriptor value is undefined.');
        }
        return modifyMethodCacheDescriptor(cacheConfig, descriptor);
    };
}
function Cache(cacheConfigOrTarget, propertyKey, descriptor) {
    var defaultCacheConfig = {};
    // if decorator called with config as @Cache({ ... })
    if (!propertyKey) {
        return CacheBuilder(cacheConfigOrTarget);
    }
    // decorator called as @Cache
    if (!descriptor) {
        throw new rubic_sdk_error_1.RubicSdkError('Descriptor is undefined.');
    }
    return CacheBuilder(defaultCacheConfig)(cacheConfigOrTarget, propertyKey, descriptor);
}
exports.Cache = Cache;
/**
 * Decorated function should returns {@link ConditionalResult}.
 * You have to check types by yourself {@see https://github.com/microsoft/TypeScript/issues/4881}
 */
function PConditionalCache(_, __, descriptor) {
    var originalMethod = descriptor.value;
    if (!originalMethod) {
        throw new rubic_sdk_error_1.RubicSdkError('Descriptor value is undefined.');
    }
    var storage = new WeakMap();
    descriptor.value = function method() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var instanceStore, key, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!storage.has(this)) {
                            storage.set(this, new Map());
                        }
                        instanceStore = storage.get(this);
                        key = generateKey(args);
                        if (instanceStore.has(key)) {
                            return [2 /*return*/, instanceStore.get(key)];
                        }
                        return [4 /*yield*/, originalMethod.apply(this, args)];
                    case 1:
                        result = _a.sent();
                        if (result.notSave) {
                            instanceStore.delete(key);
                        }
                        else {
                            instanceStore.set(key, result.value);
                        }
                        return [2 /*return*/, result.value];
                }
            });
        });
    };
}
exports.PConditionalCache = PConditionalCache;
//# sourceMappingURL=cache.decorator.js.map