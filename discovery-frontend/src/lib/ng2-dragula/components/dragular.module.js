"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require("@angular/core");
var dragula_directive_1 = require("./dragula.directive");
var dragula_provider_1 = require("./dragula.provider");
var DragulaModule = (function () {
    function DragulaModule() {
    }
    return DragulaModule;
}());
DragulaModule = __decorate([
    core_1.NgModule({
        exports: [dragula_directive_1.DragulaDirective],
        declarations: [dragula_directive_1.DragulaDirective],
        providers: [dragula_provider_1.DragulaService]
    })
], DragulaModule);
exports.DragulaModule = DragulaModule;
