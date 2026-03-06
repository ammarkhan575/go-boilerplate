"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiContract = void 0;
var core_1 = require("@ts-rest/core");
var health_js_1 = require("./health.js");
var c = (0, core_1.initContract)();
exports.apiContract = c.router({
    Health: health_js_1.healthContract,
});
