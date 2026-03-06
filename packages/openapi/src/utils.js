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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSecurityMetadata = void 0;
var ts_pattern_1 = require("ts-pattern");
var getSecurityMetadata = function (_a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.security, security = _c === void 0 ? true : _c, _d = _b.securityType, securityType = _d === void 0 ? "bearer" : _d;
    var openApiSecurity = (0, ts_pattern_1.match)(securityType)
        .with("bearer", function () { return [
        {
            bearerAuth: [],
        },
    ]; })
        .with("service", function () { return [
        {
            "x-service-token": [],
        },
    ]; })
        .exhaustive();
    return __assign({}, (security && { openApiSecurity: openApiSecurity }));
};
exports.getSecurityMetadata = getSecurityMetadata;
