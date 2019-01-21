import {CommonTokenStream, Parser, ParserRuleContext, Token} from 'antlr4';
import {TerminalNode} from 'antlr4/tree/Tree';


export declare class RulesetContext extends ParserRuleContext {
    
  RULE_NAME(): TerminalNode;
    
}

export declare class ArgsContext extends ParserRuleContext {
    
  ARG_NAME(): TerminalNode;
    
  expr(): ExprContext;
    
}

export declare class FunctionArrayExprContext extends ParserRuleContext {
    
}

export declare class DoubleExprContext extends ParserRuleContext {
    
  DOUBLE(): TerminalNode;
    
}

export declare class RegularExprContext extends ParserRuleContext {
    
  REGEX(): TerminalNode;
    
}

export declare class AddSubExprContext extends ParserRuleContext {
    
}

export declare class NullExprContext extends ParserRuleContext {
    
  NULL(): TerminalNode;
    
}

export declare class LongExprContext extends ParserRuleContext {
    
  LONG(): TerminalNode;
    
}

export declare class LogicalAndOrExprContext extends ParserRuleContext {
    
}

export declare class BooleanExprContext extends ParserRuleContext {
    
  BOOLEAN(): TerminalNode;
    
}

export declare class NestedExprContext extends ParserRuleContext {
    
  expr(): ExprContext;
    
}

export declare class DoubleArrayExprContext extends ParserRuleContext {
    
}

export declare class StringArrayExprContext extends ParserRuleContext {
    
}

export declare class LongArrayExprContext extends ParserRuleContext {
    
}

export declare class LogicalOpExprContext extends ParserRuleContext {
    
}

export declare class FunctionExprContext extends ParserRuleContext {
    
  fn(): FnContext;
    
}

export declare class ExprArrayExprContext extends ParserRuleContext {
    
}

export declare class StringExprContext extends ParserRuleContext {
    
  STRING(): TerminalNode;
    
}

export declare class UnaryOpExprContext extends ParserRuleContext {
    
  expr(): ExprContext;
    
}

export declare class IdentifierArrayExprContext extends ParserRuleContext {
    
}

export declare class LogicalAndOrExpr2Context extends ParserRuleContext {
    
}

export declare class MulDivModuloExprContext extends ParserRuleContext {
    
}

export declare class PowOpExprContext extends ParserRuleContext {
    
}

export declare class AssignExprContext extends ParserRuleContext {
    
}

export declare class IdentifierExprContext extends ParserRuleContext {
    
  IDENTIFIER(): TerminalNode;
    
}

export declare class FnContext extends ParserRuleContext {
    
  IDENTIFIER(): TerminalNode;
    
  fnArgs(): FnArgsContext;
    
}

export declare class FunctionArgsContext extends ParserRuleContext {
    
}

export declare class FnArgsContext extends ParserRuleContext {
    
}

export declare class ExprContext extends ParserRuleContext {
    
}


export declare class RuleParser extends Parser {
  ruleNames: string[];
  literalNames: string[];
  symbolicNames: string[];
  buildParseTrees: boolean;

  constructor(input: CommonTokenStream);
  
  ruleset(): RulesetContext;

  args(): ArgsContext;

  fn(): FnContext;

  fnArgs(): FnArgsContext;

  addErrorListener(listener): void;
  
  removeErrorListeners(): void;

  getTokenStream(): CommonTokenStream;

}
