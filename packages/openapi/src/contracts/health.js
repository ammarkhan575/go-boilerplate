"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthContract = void 0;
var core_1 = require("@ts-rest/core");
var zod_1 = require("@boilerplate/zod");
var c = (0, core_1.initContract)();
exports.healthContract = c.router({
    getHealth: {
        summary: "Get health",
        path: "/status",
        method: "GET",
        description: "Get health status",
        responses: {
            200: zod_1.ZHealthResponse,
        },
    },
});
