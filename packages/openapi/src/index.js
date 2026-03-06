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
exports.OpenAPI = void 0;
var zod_openapi_1 = require("@anatine/zod-openapi");
var zod_1 = require("zod");
(0, zod_openapi_1.extendZodWithOpenApi)(zod_1.z);
var open_api_1 = require("@ts-rest/open-api");
var index_js_1 = require("./contracts/index.js");
var hasSecurity = function (metadata) {
    return (!!metadata && typeof metadata === "object" && "openApiSecurity" in metadata);
};
var operationMapper = function (operation, appRoute) { return (__assign(__assign({}, operation), (hasSecurity(appRoute.metadata)
    ? {
        security: appRoute.metadata.openApiSecurity,
    }
    : {}))); };
exports.OpenAPI = Object.assign((0, open_api_1.generateOpenApi)(index_js_1.apiContract, {
    openapi: "3.0.2",
    info: {
        version: "1.0.0",
        title: "Boilerplate REST API - Documentation",
        description: "Boilerplate REST API - Documentation",
    },
    servers: [
        {
            url: "http://localhost:8080",
            description: "Local Server",
        },
    ],
}, {
    operationMapper: operationMapper,
    setOperationId: true,
}), {
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
            },
            "x-service-token": {
                type: "apiKey",
                name: "x-service-token",
                in: "header",
            },
        },
    },
});
