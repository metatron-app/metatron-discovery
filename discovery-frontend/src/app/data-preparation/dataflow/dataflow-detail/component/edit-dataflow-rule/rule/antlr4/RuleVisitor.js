// Generated from src/app/rule/antlr4/Rule.g4 by ANTLR 4.7.2
// jshint ignore: start
var antlr4 = require('antlr4/index');

// This class defines a complete generic visitor for a parse tree produced by RuleParser.

function RuleVisitor() {
	antlr4.tree.ParseTreeVisitor.call(this);
	return this;
}

RuleVisitor.prototype = Object.create(antlr4.tree.ParseTreeVisitor.prototype);
RuleVisitor.prototype.constructor = RuleVisitor;

// Visit a parse tree produced by RuleParser#ruleset.
RuleVisitor.prototype.visitRuleset = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by RuleParser#args.
RuleVisitor.prototype.visitArgs = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by RuleParser#functionArrayExpr.
RuleVisitor.prototype.visitFunctionArrayExpr = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by RuleParser#doubleExpr.
RuleVisitor.prototype.visitDoubleExpr = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by RuleParser#regularExpr.
RuleVisitor.prototype.visitRegularExpr = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by RuleParser#addSubExpr.
RuleVisitor.prototype.visitAddSubExpr = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by RuleParser#nullExpr.
RuleVisitor.prototype.visitNullExpr = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by RuleParser#longExpr.
RuleVisitor.prototype.visitLongExpr = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by RuleParser#logicalAndOrExpr.
RuleVisitor.prototype.visitLogicalAndOrExpr = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by RuleParser#booleanExpr.
RuleVisitor.prototype.visitBooleanExpr = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by RuleParser#nestedExpr.
RuleVisitor.prototype.visitNestedExpr = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by RuleParser#doubleArrayExpr.
RuleVisitor.prototype.visitDoubleArrayExpr = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by RuleParser#stringArrayExpr.
RuleVisitor.prototype.visitStringArrayExpr = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by RuleParser#longArrayExpr.
RuleVisitor.prototype.visitLongArrayExpr = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by RuleParser#logicalOpExpr.
RuleVisitor.prototype.visitLogicalOpExpr = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by RuleParser#functionExpr.
RuleVisitor.prototype.visitFunctionExpr = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by RuleParser#exprArrayExpr.
RuleVisitor.prototype.visitExprArrayExpr = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by RuleParser#stringExpr.
RuleVisitor.prototype.visitStringExpr = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by RuleParser#unaryOpExpr.
RuleVisitor.prototype.visitUnaryOpExpr = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by RuleParser#identifierArrayExpr.
RuleVisitor.prototype.visitIdentifierArrayExpr = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by RuleParser#logicalAndOrExpr2.
RuleVisitor.prototype.visitLogicalAndOrExpr2 = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by RuleParser#mulDivModuloExpr.
RuleVisitor.prototype.visitMulDivModuloExpr = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by RuleParser#powOpExpr.
RuleVisitor.prototype.visitPowOpExpr = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by RuleParser#assignExpr.
RuleVisitor.prototype.visitAssignExpr = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by RuleParser#identifierExpr.
RuleVisitor.prototype.visitIdentifierExpr = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by RuleParser#fn.
RuleVisitor.prototype.visitFn = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by RuleParser#functionArgs.
RuleVisitor.prototype.visitFunctionArgs = function(ctx) {
  return this.visitChildren(ctx);
};



exports.RuleVisitor = RuleVisitor;