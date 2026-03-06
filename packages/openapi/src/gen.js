"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var index_js_1 = require("./index.js");
var replaceCustomFileTypesToOpenApiCompatible = function (jsonString) {
    var searchPattern = /{"type":"object","properties":{"type":{"type":"string","enum":\["file"\]}},\s*"required":\["type"\]}/g;
    var replacement = "{\"type\":\"string\",\"format\":\"binary\"}";
    return jsonString.replace(searchPattern, replacement);
};
var filteredDoc = replaceCustomFileTypesToOpenApiCompatible(JSON.stringify(index_js_1.OpenAPI));
var formattedDoc = JSON.parse(filteredDoc);
var filePaths = [
    "./openapi.json",
    "../../apps/backend/static/openapi.json",
];
filePaths.forEach(function (filePath) {
    fs_1.default.writeFile(filePath, JSON.stringify(formattedDoc, null, 2), function (err) {
        if (err) {
            console.error("Error writing to ".concat(filePath, ":"), err);
        }
    });
});
