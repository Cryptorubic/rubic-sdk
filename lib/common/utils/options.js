"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deadlineMinutesTimestamp = exports.combineOptions = void 0;
function combineOptions(options, defaultOptions) {
    return Object.fromEntries(Object.entries(defaultOptions).map(function (_a) {
        var key = _a[0], value = _a[1];
        return [
            key,
            (options === null || options === void 0 ? void 0 : options[key]) ? options === null || options === void 0 ? void 0 : options[key] : value
        ];
    }));
}
exports.combineOptions = combineOptions;
function deadlineMinutesTimestamp(deadlineMinutes) {
    return Math.floor(Date.now() / 1000 + 60 * deadlineMinutes);
}
exports.deadlineMinutesTimestamp = deadlineMinutesTimestamp;
//# sourceMappingURL=options.js.map