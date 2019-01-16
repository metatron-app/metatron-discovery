// Generated from src/app/rule/antlr4/Rule.g4 by ANTLR 4.7.2
// jshint ignore: start
var antlr4 = require('antlr4/index');
var RuleVisitor = require('./RuleVisitor').RuleVisitor;

var grammarFileName = "Rule.g4";


var serializedATN = ["\u0003\u608b\ua72a\u8133\ub9ed\u417c\u3be7\u7786\u5964",
    "\u0003\"|\u0004\u0002\t\u0002\u0004\u0003\t\u0003\u0004\u0004\t\u0004",
    "\u0004\u0005\t\u0005\u0004\u0006\t\u0006\u0003\u0002\u0003\u0002\u0007",
    "\u0002\u000f\n\u0002\f\u0002\u000e\u0002\u0012\u000b\u0002\u0003\u0003",
    "\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0004\u0003\u0004\u0003\u0004",
    "\u0003\u0004\u0003\u0004\u0003\u0004\u0003\u0004\u0003\u0004\u0003\u0004",
    "\u0003\u0004\u0003\u0004\u0006\u0004#\n\u0004\r\u0004\u000e\u0004$\u0003",
    "\u0004\u0003\u0004\u0003\u0004\u0003\u0004\u0003\u0004\u0003\u0004\u0003",
    "\u0004\u0003\u0004\u0003\u0004\u0003\u0004\u0006\u00041\n\u0004\r\u0004",
    "\u000e\u00042\u0003\u0004\u0003\u0004\u0003\u0004\u0006\u00048\n\u0004",
    "\r\u0004\u000e\u00049\u0003\u0004\u0003\u0004\u0003\u0004\u0006\u0004",
    "?\n\u0004\r\u0004\u000e\u0004@\u0003\u0004\u0003\u0004\u0003\u0004\u0006",
    "\u0004F\n\u0004\r\u0004\u000e\u0004G\u0005\u0004J\n\u0004\u0003\u0004",
    "\u0003\u0004\u0003\u0004\u0003\u0004\u0003\u0004\u0003\u0004\u0003\u0004",
    "\u0003\u0004\u0003\u0004\u0003\u0004\u0003\u0004\u0003\u0004\u0003\u0004",
    "\u0003\u0004\u0003\u0004\u0003\u0004\u0003\u0004\u0003\u0004\u0003\u0004",
    "\u0003\u0004\u0003\u0004\u0003\u0004\u0003\u0004\u0003\u0004\u0006\u0004",
    "d\n\u0004\r\u0004\u000e\u0004e\u0007\u0004h\n\u0004\f\u0004\u000e\u0004",
    "k\u000b\u0004\u0003\u0005\u0003\u0005\u0003\u0005\u0005\u0005p\n\u0005",
    "\u0003\u0005\u0003\u0005\u0003\u0006\u0003\u0006\u0003\u0006\u0007\u0006",
    "w\n\u0006\f\u0006\u000e\u0006z\u000b\u0006\u0003\u0006\u0002\u0003\u0006",
    "\u0007\u0002\u0004\u0006\b\n\u0002\b\u0003\u0002\u0013\u0014\u0003\u0002",
    "\u0016\u0018\u0004\u0002\u0013\u0013\u0019\u0019\u0004\u0002\u001a\u001f",
    "\"\"\u0003\u0002 !\u0003\u0002\u0004\u0005\u0002\u0095\u0002\f\u0003",
    "\u0002\u0002\u0002\u0004\u0013\u0003\u0002\u0002\u0002\u0006I\u0003",
    "\u0002\u0002\u0002\bl\u0003\u0002\u0002\u0002\ns\u0003\u0002\u0002\u0002",
    "\f\u0010\u0007\n\u0002\u0002\r\u000f\u0005\u0004\u0003\u0002\u000e\r",
    "\u0003\u0002\u0002\u0002\u000f\u0012\u0003\u0002\u0002\u0002\u0010\u000e",
    "\u0003\u0002\u0002\u0002\u0010\u0011\u0003\u0002\u0002\u0002\u0011\u0003",
    "\u0003\u0002\u0002\u0002\u0012\u0010\u0003\u0002\u0002\u0002\u0013\u0014",
    "\u0007\u000b\u0002\u0002\u0014\u0015\u0007\u0003\u0002\u0002\u0015\u0016",
    "\u0005\u0006\u0004\u0002\u0016\u0005\u0003\u0002\u0002\u0002\u0017\u0018",
    "\b\u0004\u0001\u0002\u0018\u0019\t\u0002\u0002\u0002\u0019J\u0005\u0006",
    "\u0004\u0019\u001a\u001b\u0007\u0006\u0002\u0002\u001b\u001c\u0005\u0006",
    "\u0004\u0002\u001c\u001d\u0007\u0007\u0002\u0002\u001dJ\u0003\u0002",
    "\u0002\u0002\u001eJ\u0005\b\u0005\u0002\u001f\"\u0005\b\u0005\u0002",
    " !\u0007\b\u0002\u0002!#\u0005\b\u0005\u0002\" \u0003\u0002\u0002\u0002",
    "#$\u0003\u0002\u0002\u0002$\"\u0003\u0002\u0002\u0002$%\u0003\u0002",
    "\u0002\u0002%J\u0003\u0002\u0002\u0002&J\u0007\r\u0002\u0002\'J\u0007",
    "\u000e\u0002\u0002(J\u0007\u0010\u0002\u0002)J\u0007\u000f\u0002\u0002",
    "*J\u0007\f\u0002\u0002+J\u0007\u0011\u0002\u0002,J\u0007\u0012\u0002",
    "\u0002-0\u0007\r\u0002\u0002./\u0007\b\u0002\u0002/1\u0007\r\u0002\u0002",
    "0.\u0003\u0002\u0002\u000212\u0003\u0002\u0002\u000220\u0003\u0002\u0002",
    "\u000223\u0003\u0002\u0002\u00023J\u0003\u0002\u0002\u000247\u0007\u0011",
    "\u0002\u000256\u0007\b\u0002\u000268\u0007\u0011\u0002\u000275\u0003",
    "\u0002\u0002\u000289\u0003\u0002\u0002\u000297\u0003\u0002\u0002\u0002",
    "9:\u0003\u0002\u0002\u0002:J\u0003\u0002\u0002\u0002;>\u0007\u000f\u0002",
    "\u0002<=\u0007\b\u0002\u0002=?\u0007\u000f\u0002\u0002><\u0003\u0002",
    "\u0002\u0002?@\u0003\u0002\u0002\u0002@>\u0003\u0002\u0002\u0002@A\u0003",
    "\u0002\u0002\u0002AJ\u0003\u0002\u0002\u0002BE\u0007\u0010\u0002\u0002",
    "CD\u0007\b\u0002\u0002DF\u0007\u0010\u0002\u0002EC\u0003\u0002\u0002",
    "\u0002FG\u0003\u0002\u0002\u0002GE\u0003\u0002\u0002\u0002GH\u0003\u0002",
    "\u0002\u0002HJ\u0003\u0002\u0002\u0002I\u0017\u0003\u0002\u0002\u0002",
    "I\u001a\u0003\u0002\u0002\u0002I\u001e\u0003\u0002\u0002\u0002I\u001f",
    "\u0003\u0002\u0002\u0002I&\u0003\u0002\u0002\u0002I\'\u0003\u0002\u0002",
    "\u0002I(\u0003\u0002\u0002\u0002I)\u0003\u0002\u0002\u0002I*\u0003\u0002",
    "\u0002\u0002I+\u0003\u0002\u0002\u0002I,\u0003\u0002\u0002\u0002I-\u0003",
    "\u0002\u0002\u0002I4\u0003\u0002\u0002\u0002I;\u0003\u0002\u0002\u0002",
    "IB\u0003\u0002\u0002\u0002Ji\u0003\u0002\u0002\u0002KL\f\u0018\u0002",
    "\u0002LM\u0007\u0015\u0002\u0002Mh\u0005\u0006\u0004\u0018NO\f\u0017",
    "\u0002\u0002OP\t\u0003\u0002\u0002Ph\u0005\u0006\u0004\u0018QR\f\u0016",
    "\u0002\u0002RS\t\u0004\u0002\u0002Sh\u0005\u0006\u0004\u0017TU\f\u0015",
    "\u0002\u0002UV\t\u0005\u0002\u0002Vh\u0005\u0006\u0004\u0016WX\f\u0014",
    "\u0002\u0002XY\t\u0006\u0002\u0002Yh\u0005\u0006\u0004\u0015Z[\f\u0013",
    "\u0002\u0002[\\\t\u0007\u0002\u0002\\h\u0005\u0006\u0004\u0014]^\f\u0012",
    "\u0002\u0002^_\u0007\"\u0002\u0002_h\u0005\u0006\u0004\u0013`c\f\u0003",
    "\u0002\u0002ab\u0007\b\u0002\u0002bd\u0005\u0006\u0004\u0002ca\u0003",
    "\u0002\u0002\u0002de\u0003\u0002\u0002\u0002ec\u0003\u0002\u0002\u0002",
    "ef\u0003\u0002\u0002\u0002fh\u0003\u0002\u0002\u0002gK\u0003\u0002\u0002",
    "\u0002gN\u0003\u0002\u0002\u0002gQ\u0003\u0002\u0002\u0002gT\u0003\u0002",
    "\u0002\u0002gW\u0003\u0002\u0002\u0002gZ\u0003\u0002\u0002\u0002g]\u0003",
    "\u0002\u0002\u0002g`\u0003\u0002\u0002\u0002hk\u0003\u0002\u0002\u0002",
    "ig\u0003\u0002\u0002\u0002ij\u0003\u0002\u0002\u0002j\u0007\u0003\u0002",
    "\u0002\u0002ki\u0003\u0002\u0002\u0002lm\u0007\r\u0002\u0002mo\u0007",
    "\u0006\u0002\u0002np\u0005\n\u0006\u0002on\u0003\u0002\u0002\u0002o",
    "p\u0003\u0002\u0002\u0002pq\u0003\u0002\u0002\u0002qr\u0007\u0007\u0002",
    "\u0002r\t\u0003\u0002\u0002\u0002sx\u0005\u0006\u0004\u0002tu\u0007",
    "\b\u0002\u0002uw\u0005\u0006\u0004\u0002vt\u0003\u0002\u0002\u0002w",
    "z\u0003\u0002\u0002\u0002xv\u0003\u0002\u0002\u0002xy\u0003\u0002\u0002",
    "\u0002y\u000b\u0003\u0002\u0002\u0002zx\u0003\u0002\u0002\u0002\u000e",
    "\u0010$29@GIegiox"].join("");


var atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

var decisionsToDFA = atn.decisionToState.map( function(ds, index) { return new antlr4.dfa.DFA(ds, index); });

var sharedContextCache = new antlr4.PredictionContextCache();

var literalNames = [ null, "':'", "'&'", "'|'", "'('", "')'", "','", null, 
                     null, null, null, null, "'null'", null, null, null, 
                     null, "'-'", "'!'", "'^'", "'*'", "'/'", "'%'", "'+'", 
                     "'<'", "'<='", "'>'", "'>='", "'=='", "'!='", "'&&'", 
                     "'||'", "'='" ];

var symbolicNames = [ null, null, null, null, null, null, null, "WS", "RULE_NAME", 
                      "ARG_NAME", "BOOLEAN", "IDENTIFIER", "NULL", "LONG", 
                      "DOUBLE", "STRING", "REGEX", "MINUS", "NOT", "POW", 
                      "MUL", "DIV", "MODULO", "PLUS", "LT", "LEQ", "GT", 
                      "GEQ", "EQ", "NEQ", "AND", "OR", "ASSIGN" ];

var ruleNames =  [ "ruleset", "args", "expr", "fn", "fnArgs" ];

function RuleParser (input) {
	antlr4.Parser.call(this, input);
    this._interp = new antlr4.atn.ParserATNSimulator(this, atn, decisionsToDFA, sharedContextCache);
    this.ruleNames = ruleNames;
    this.literalNames = literalNames;
    this.symbolicNames = symbolicNames;
    //return this;
}

RuleParser.prototype = Object.create(antlr4.Parser.prototype);
RuleParser.prototype.constructor = RuleParser;

Object.defineProperty(RuleParser.prototype, "atn", {
	get : function() {
		return atn;
	}
});

RuleParser.EOF = antlr4.Token.EOF;
RuleParser.T__0 = 1;
RuleParser.T__1 = 2;
RuleParser.T__2 = 3;
RuleParser.T__3 = 4;
RuleParser.T__4 = 5;
RuleParser.T__5 = 6;
RuleParser.WS = 7;
RuleParser.RULE_NAME = 8;
RuleParser.ARG_NAME = 9;
RuleParser.BOOLEAN = 10;
RuleParser.IDENTIFIER = 11;
RuleParser.NULL = 12;
RuleParser.LONG = 13;
RuleParser.DOUBLE = 14;
RuleParser.STRING = 15;
RuleParser.REGEX = 16;
RuleParser.MINUS = 17;
RuleParser.NOT = 18;
RuleParser.POW = 19;
RuleParser.MUL = 20;
RuleParser.DIV = 21;
RuleParser.MODULO = 22;
RuleParser.PLUS = 23;
RuleParser.LT = 24;
RuleParser.LEQ = 25;
RuleParser.GT = 26;
RuleParser.GEQ = 27;
RuleParser.EQ = 28;
RuleParser.NEQ = 29;
RuleParser.AND = 30;
RuleParser.OR = 31;
RuleParser.ASSIGN = 32;

RuleParser.RULE_ruleset = 0;
RuleParser.RULE_args = 1;
RuleParser.RULE_expr = 2;
RuleParser.RULE_fn = 3;
RuleParser.RULE_fnArgs = 4;


function RulesetContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = RuleParser.RULE_ruleset;
    return this;
}

RulesetContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
RulesetContext.prototype.constructor = RulesetContext;

RulesetContext.prototype.RULE_NAME = function() {
    return this.getToken(RuleParser.RULE_NAME, 0);
};

RulesetContext.prototype.args = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ArgsContext);
    } else {
        return this.getTypedRuleContext(ArgsContext,i);
    }
};

RulesetContext.prototype.accept = function(visitor) {
    if ( visitor instanceof RuleVisitor ) {
        return visitor.visitRuleset(this);
    } else {
        return visitor.visitChildren(this);
    }
};




RuleParser.RulesetContext = RulesetContext;

RuleParser.prototype.ruleset = function() {

    var localctx = new RulesetContext(this, this._ctx, this.state);
    this.enterRule(localctx, 0, RuleParser.RULE_ruleset);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 10;
        this.match(RuleParser.RULE_NAME);
        this.state = 14;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===RuleParser.ARG_NAME) {
            this.state = 11;
            this.args();
            this.state = 16;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};


function ArgsContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = RuleParser.RULE_args;
    return this;
}

ArgsContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ArgsContext.prototype.constructor = ArgsContext;

ArgsContext.prototype.ARG_NAME = function() {
    return this.getToken(RuleParser.ARG_NAME, 0);
};

ArgsContext.prototype.expr = function() {
    return this.getTypedRuleContext(ExprContext,0);
};

ArgsContext.prototype.accept = function(visitor) {
    if ( visitor instanceof RuleVisitor ) {
        return visitor.visitArgs(this);
    } else {
        return visitor.visitChildren(this);
    }
};




RuleParser.ArgsContext = ArgsContext;

RuleParser.prototype.args = function() {

    var localctx = new ArgsContext(this, this._ctx, this.state);
    this.enterRule(localctx, 2, RuleParser.RULE_args);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 17;
        this.match(RuleParser.ARG_NAME);
        this.state = 18;
        this.match(RuleParser.T__0);
        this.state = 19;
        this.expr(0);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};


function ExprContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = RuleParser.RULE_expr;
    return this;
}

ExprContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ExprContext.prototype.constructor = ExprContext;


 
ExprContext.prototype.copyFrom = function(ctx) {
    antlr4.ParserRuleContext.prototype.copyFrom.call(this, ctx);
};

function FunctionArrayExprContext(parser, ctx) {
	ExprContext.call(this, parser);
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

FunctionArrayExprContext.prototype = Object.create(ExprContext.prototype);
FunctionArrayExprContext.prototype.constructor = FunctionArrayExprContext;

RuleParser.FunctionArrayExprContext = FunctionArrayExprContext;

FunctionArrayExprContext.prototype.fn = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(FnContext);
    } else {
        return this.getTypedRuleContext(FnContext,i);
    }
};
FunctionArrayExprContext.prototype.accept = function(visitor) {
    if ( visitor instanceof RuleVisitor ) {
        return visitor.visitFunctionArrayExpr(this);
    } else {
        return visitor.visitChildren(this);
    }
};


function DoubleExprContext(parser, ctx) {
	ExprContext.call(this, parser);
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

DoubleExprContext.prototype = Object.create(ExprContext.prototype);
DoubleExprContext.prototype.constructor = DoubleExprContext;

RuleParser.DoubleExprContext = DoubleExprContext;

DoubleExprContext.prototype.DOUBLE = function() {
    return this.getToken(RuleParser.DOUBLE, 0);
};
DoubleExprContext.prototype.accept = function(visitor) {
    if ( visitor instanceof RuleVisitor ) {
        return visitor.visitDoubleExpr(this);
    } else {
        return visitor.visitChildren(this);
    }
};


function RegularExprContext(parser, ctx) {
	ExprContext.call(this, parser);
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

RegularExprContext.prototype = Object.create(ExprContext.prototype);
RegularExprContext.prototype.constructor = RegularExprContext;

RuleParser.RegularExprContext = RegularExprContext;

RegularExprContext.prototype.REGEX = function() {
    return this.getToken(RuleParser.REGEX, 0);
};
RegularExprContext.prototype.accept = function(visitor) {
    if ( visitor instanceof RuleVisitor ) {
        return visitor.visitRegularExpr(this);
    } else {
        return visitor.visitChildren(this);
    }
};


function AddSubExprContext(parser, ctx) {
	ExprContext.call(this, parser);
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

AddSubExprContext.prototype = Object.create(ExprContext.prototype);
AddSubExprContext.prototype.constructor = AddSubExprContext;

RuleParser.AddSubExprContext = AddSubExprContext;

AddSubExprContext.prototype.expr = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ExprContext);
    } else {
        return this.getTypedRuleContext(ExprContext,i);
    }
};

AddSubExprContext.prototype.PLUS = function() {
    return this.getToken(RuleParser.PLUS, 0);
};

AddSubExprContext.prototype.MINUS = function() {
    return this.getToken(RuleParser.MINUS, 0);
};
AddSubExprContext.prototype.accept = function(visitor) {
    if ( visitor instanceof RuleVisitor ) {
        return visitor.visitAddSubExpr(this);
    } else {
        return visitor.visitChildren(this);
    }
};


function NullExprContext(parser, ctx) {
	ExprContext.call(this, parser);
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

NullExprContext.prototype = Object.create(ExprContext.prototype);
NullExprContext.prototype.constructor = NullExprContext;

RuleParser.NullExprContext = NullExprContext;

NullExprContext.prototype.NULL = function() {
    return this.getToken(RuleParser.NULL, 0);
};
NullExprContext.prototype.accept = function(visitor) {
    if ( visitor instanceof RuleVisitor ) {
        return visitor.visitNullExpr(this);
    } else {
        return visitor.visitChildren(this);
    }
};


function LongExprContext(parser, ctx) {
	ExprContext.call(this, parser);
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

LongExprContext.prototype = Object.create(ExprContext.prototype);
LongExprContext.prototype.constructor = LongExprContext;

RuleParser.LongExprContext = LongExprContext;

LongExprContext.prototype.LONG = function() {
    return this.getToken(RuleParser.LONG, 0);
};
LongExprContext.prototype.accept = function(visitor) {
    if ( visitor instanceof RuleVisitor ) {
        return visitor.visitLongExpr(this);
    } else {
        return visitor.visitChildren(this);
    }
};


function LogicalAndOrExprContext(parser, ctx) {
	ExprContext.call(this, parser);
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

LogicalAndOrExprContext.prototype = Object.create(ExprContext.prototype);
LogicalAndOrExprContext.prototype.constructor = LogicalAndOrExprContext;

RuleParser.LogicalAndOrExprContext = LogicalAndOrExprContext;

LogicalAndOrExprContext.prototype.expr = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ExprContext);
    } else {
        return this.getTypedRuleContext(ExprContext,i);
    }
};

LogicalAndOrExprContext.prototype.AND = function() {
    return this.getToken(RuleParser.AND, 0);
};

LogicalAndOrExprContext.prototype.OR = function() {
    return this.getToken(RuleParser.OR, 0);
};
LogicalAndOrExprContext.prototype.accept = function(visitor) {
    if ( visitor instanceof RuleVisitor ) {
        return visitor.visitLogicalAndOrExpr(this);
    } else {
        return visitor.visitChildren(this);
    }
};


function BooleanExprContext(parser, ctx) {
	ExprContext.call(this, parser);
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

BooleanExprContext.prototype = Object.create(ExprContext.prototype);
BooleanExprContext.prototype.constructor = BooleanExprContext;

RuleParser.BooleanExprContext = BooleanExprContext;

BooleanExprContext.prototype.BOOLEAN = function() {
    return this.getToken(RuleParser.BOOLEAN, 0);
};
BooleanExprContext.prototype.accept = function(visitor) {
    if ( visitor instanceof RuleVisitor ) {
        return visitor.visitBooleanExpr(this);
    } else {
        return visitor.visitChildren(this);
    }
};


function NestedExprContext(parser, ctx) {
	ExprContext.call(this, parser);
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

NestedExprContext.prototype = Object.create(ExprContext.prototype);
NestedExprContext.prototype.constructor = NestedExprContext;

RuleParser.NestedExprContext = NestedExprContext;

NestedExprContext.prototype.expr = function() {
    return this.getTypedRuleContext(ExprContext,0);
};
NestedExprContext.prototype.accept = function(visitor) {
    if ( visitor instanceof RuleVisitor ) {
        return visitor.visitNestedExpr(this);
    } else {
        return visitor.visitChildren(this);
    }
};


function DoubleArrayExprContext(parser, ctx) {
	ExprContext.call(this, parser);
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

DoubleArrayExprContext.prototype = Object.create(ExprContext.prototype);
DoubleArrayExprContext.prototype.constructor = DoubleArrayExprContext;

RuleParser.DoubleArrayExprContext = DoubleArrayExprContext;

DoubleArrayExprContext.prototype.DOUBLE = function(i) {
	if(i===undefined) {
		i = null;
	}
    if(i===null) {
        return this.getTokens(RuleParser.DOUBLE);
    } else {
        return this.getToken(RuleParser.DOUBLE, i);
    }
};

DoubleArrayExprContext.prototype.accept = function(visitor) {
    if ( visitor instanceof RuleVisitor ) {
        return visitor.visitDoubleArrayExpr(this);
    } else {
        return visitor.visitChildren(this);
    }
};


function StringArrayExprContext(parser, ctx) {
	ExprContext.call(this, parser);
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

StringArrayExprContext.prototype = Object.create(ExprContext.prototype);
StringArrayExprContext.prototype.constructor = StringArrayExprContext;

RuleParser.StringArrayExprContext = StringArrayExprContext;

StringArrayExprContext.prototype.STRING = function(i) {
	if(i===undefined) {
		i = null;
	}
    if(i===null) {
        return this.getTokens(RuleParser.STRING);
    } else {
        return this.getToken(RuleParser.STRING, i);
    }
};

StringArrayExprContext.prototype.accept = function(visitor) {
    if ( visitor instanceof RuleVisitor ) {
        return visitor.visitStringArrayExpr(this);
    } else {
        return visitor.visitChildren(this);
    }
};


function LongArrayExprContext(parser, ctx) {
	ExprContext.call(this, parser);
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

LongArrayExprContext.prototype = Object.create(ExprContext.prototype);
LongArrayExprContext.prototype.constructor = LongArrayExprContext;

RuleParser.LongArrayExprContext = LongArrayExprContext;

LongArrayExprContext.prototype.LONG = function(i) {
	if(i===undefined) {
		i = null;
	}
    if(i===null) {
        return this.getTokens(RuleParser.LONG);
    } else {
        return this.getToken(RuleParser.LONG, i);
    }
};

LongArrayExprContext.prototype.accept = function(visitor) {
    if ( visitor instanceof RuleVisitor ) {
        return visitor.visitLongArrayExpr(this);
    } else {
        return visitor.visitChildren(this);
    }
};


function LogicalOpExprContext(parser, ctx) {
	ExprContext.call(this, parser);
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

LogicalOpExprContext.prototype = Object.create(ExprContext.prototype);
LogicalOpExprContext.prototype.constructor = LogicalOpExprContext;

RuleParser.LogicalOpExprContext = LogicalOpExprContext;

LogicalOpExprContext.prototype.expr = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ExprContext);
    } else {
        return this.getTypedRuleContext(ExprContext,i);
    }
};

LogicalOpExprContext.prototype.LT = function() {
    return this.getToken(RuleParser.LT, 0);
};

LogicalOpExprContext.prototype.LEQ = function() {
    return this.getToken(RuleParser.LEQ, 0);
};

LogicalOpExprContext.prototype.GT = function() {
    return this.getToken(RuleParser.GT, 0);
};

LogicalOpExprContext.prototype.GEQ = function() {
    return this.getToken(RuleParser.GEQ, 0);
};

LogicalOpExprContext.prototype.EQ = function() {
    return this.getToken(RuleParser.EQ, 0);
};

LogicalOpExprContext.prototype.NEQ = function() {
    return this.getToken(RuleParser.NEQ, 0);
};

LogicalOpExprContext.prototype.ASSIGN = function() {
    return this.getToken(RuleParser.ASSIGN, 0);
};
LogicalOpExprContext.prototype.accept = function(visitor) {
    if ( visitor instanceof RuleVisitor ) {
        return visitor.visitLogicalOpExpr(this);
    } else {
        return visitor.visitChildren(this);
    }
};


function FunctionExprContext(parser, ctx) {
	ExprContext.call(this, parser);
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

FunctionExprContext.prototype = Object.create(ExprContext.prototype);
FunctionExprContext.prototype.constructor = FunctionExprContext;

RuleParser.FunctionExprContext = FunctionExprContext;

FunctionExprContext.prototype.fn = function() {
    return this.getTypedRuleContext(FnContext,0);
};
FunctionExprContext.prototype.accept = function(visitor) {
    if ( visitor instanceof RuleVisitor ) {
        return visitor.visitFunctionExpr(this);
    } else {
        return visitor.visitChildren(this);
    }
};


function ExprArrayExprContext(parser, ctx) {
	ExprContext.call(this, parser);
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

ExprArrayExprContext.prototype = Object.create(ExprContext.prototype);
ExprArrayExprContext.prototype.constructor = ExprArrayExprContext;

RuleParser.ExprArrayExprContext = ExprArrayExprContext;

ExprArrayExprContext.prototype.expr = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ExprContext);
    } else {
        return this.getTypedRuleContext(ExprContext,i);
    }
};
ExprArrayExprContext.prototype.accept = function(visitor) {
    if ( visitor instanceof RuleVisitor ) {
        return visitor.visitExprArrayExpr(this);
    } else {
        return visitor.visitChildren(this);
    }
};


function StringExprContext(parser, ctx) {
	ExprContext.call(this, parser);
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

StringExprContext.prototype = Object.create(ExprContext.prototype);
StringExprContext.prototype.constructor = StringExprContext;

RuleParser.StringExprContext = StringExprContext;

StringExprContext.prototype.STRING = function() {
    return this.getToken(RuleParser.STRING, 0);
};
StringExprContext.prototype.accept = function(visitor) {
    if ( visitor instanceof RuleVisitor ) {
        return visitor.visitStringExpr(this);
    } else {
        return visitor.visitChildren(this);
    }
};


function UnaryOpExprContext(parser, ctx) {
	ExprContext.call(this, parser);
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

UnaryOpExprContext.prototype = Object.create(ExprContext.prototype);
UnaryOpExprContext.prototype.constructor = UnaryOpExprContext;

RuleParser.UnaryOpExprContext = UnaryOpExprContext;

UnaryOpExprContext.prototype.expr = function() {
    return this.getTypedRuleContext(ExprContext,0);
};

UnaryOpExprContext.prototype.MINUS = function() {
    return this.getToken(RuleParser.MINUS, 0);
};

UnaryOpExprContext.prototype.NOT = function() {
    return this.getToken(RuleParser.NOT, 0);
};
UnaryOpExprContext.prototype.accept = function(visitor) {
    if ( visitor instanceof RuleVisitor ) {
        return visitor.visitUnaryOpExpr(this);
    } else {
        return visitor.visitChildren(this);
    }
};


function IdentifierArrayExprContext(parser, ctx) {
	ExprContext.call(this, parser);
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

IdentifierArrayExprContext.prototype = Object.create(ExprContext.prototype);
IdentifierArrayExprContext.prototype.constructor = IdentifierArrayExprContext;

RuleParser.IdentifierArrayExprContext = IdentifierArrayExprContext;

IdentifierArrayExprContext.prototype.IDENTIFIER = function(i) {
	if(i===undefined) {
		i = null;
	}
    if(i===null) {
        return this.getTokens(RuleParser.IDENTIFIER);
    } else {
        return this.getToken(RuleParser.IDENTIFIER, i);
    }
};

IdentifierArrayExprContext.prototype.accept = function(visitor) {
    if ( visitor instanceof RuleVisitor ) {
        return visitor.visitIdentifierArrayExpr(this);
    } else {
        return visitor.visitChildren(this);
    }
};


function LogicalAndOrExpr2Context(parser, ctx) {
	ExprContext.call(this, parser);
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

LogicalAndOrExpr2Context.prototype = Object.create(ExprContext.prototype);
LogicalAndOrExpr2Context.prototype.constructor = LogicalAndOrExpr2Context;

RuleParser.LogicalAndOrExpr2Context = LogicalAndOrExpr2Context;

LogicalAndOrExpr2Context.prototype.expr = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ExprContext);
    } else {
        return this.getTypedRuleContext(ExprContext,i);
    }
};
LogicalAndOrExpr2Context.prototype.accept = function(visitor) {
    if ( visitor instanceof RuleVisitor ) {
        return visitor.visitLogicalAndOrExpr2(this);
    } else {
        return visitor.visitChildren(this);
    }
};


function MulDivModuloExprContext(parser, ctx) {
	ExprContext.call(this, parser);
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

MulDivModuloExprContext.prototype = Object.create(ExprContext.prototype);
MulDivModuloExprContext.prototype.constructor = MulDivModuloExprContext;

RuleParser.MulDivModuloExprContext = MulDivModuloExprContext;

MulDivModuloExprContext.prototype.expr = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ExprContext);
    } else {
        return this.getTypedRuleContext(ExprContext,i);
    }
};

MulDivModuloExprContext.prototype.MUL = function() {
    return this.getToken(RuleParser.MUL, 0);
};

MulDivModuloExprContext.prototype.DIV = function() {
    return this.getToken(RuleParser.DIV, 0);
};

MulDivModuloExprContext.prototype.MODULO = function() {
    return this.getToken(RuleParser.MODULO, 0);
};
MulDivModuloExprContext.prototype.accept = function(visitor) {
    if ( visitor instanceof RuleVisitor ) {
        return visitor.visitMulDivModuloExpr(this);
    } else {
        return visitor.visitChildren(this);
    }
};


function PowOpExprContext(parser, ctx) {
	ExprContext.call(this, parser);
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

PowOpExprContext.prototype = Object.create(ExprContext.prototype);
PowOpExprContext.prototype.constructor = PowOpExprContext;

RuleParser.PowOpExprContext = PowOpExprContext;

PowOpExprContext.prototype.expr = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ExprContext);
    } else {
        return this.getTypedRuleContext(ExprContext,i);
    }
};

PowOpExprContext.prototype.POW = function() {
    return this.getToken(RuleParser.POW, 0);
};
PowOpExprContext.prototype.accept = function(visitor) {
    if ( visitor instanceof RuleVisitor ) {
        return visitor.visitPowOpExpr(this);
    } else {
        return visitor.visitChildren(this);
    }
};


function AssignExprContext(parser, ctx) {
	ExprContext.call(this, parser);
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

AssignExprContext.prototype = Object.create(ExprContext.prototype);
AssignExprContext.prototype.constructor = AssignExprContext;

RuleParser.AssignExprContext = AssignExprContext;

AssignExprContext.prototype.expr = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ExprContext);
    } else {
        return this.getTypedRuleContext(ExprContext,i);
    }
};

AssignExprContext.prototype.ASSIGN = function() {
    return this.getToken(RuleParser.ASSIGN, 0);
};
AssignExprContext.prototype.accept = function(visitor) {
    if ( visitor instanceof RuleVisitor ) {
        return visitor.visitAssignExpr(this);
    } else {
        return visitor.visitChildren(this);
    }
};


function IdentifierExprContext(parser, ctx) {
	ExprContext.call(this, parser);
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

IdentifierExprContext.prototype = Object.create(ExprContext.prototype);
IdentifierExprContext.prototype.constructor = IdentifierExprContext;

RuleParser.IdentifierExprContext = IdentifierExprContext;

IdentifierExprContext.prototype.IDENTIFIER = function() {
    return this.getToken(RuleParser.IDENTIFIER, 0);
};
IdentifierExprContext.prototype.accept = function(visitor) {
    if ( visitor instanceof RuleVisitor ) {
        return visitor.visitIdentifierExpr(this);
    } else {
        return visitor.visitChildren(this);
    }
};



RuleParser.prototype.expr = function(_p) {
	if(_p===undefined) {
	    _p = 0;
	}
    var _parentctx = this._ctx;
    var _parentState = this.state;
    var localctx = new ExprContext(this, this._ctx, _parentState);
    var _prevctx = localctx;
    var _startState = 4;
    this.enterRecursionRule(localctx, 4, RuleParser.RULE_expr, _p);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 71;
        this._errHandler.sync(this);
        var la_ = this._interp.adaptivePredict(this._input,6,this._ctx);
        switch(la_) {
        case 1:
            localctx = new UnaryOpExprContext(this, localctx);
            this._ctx = localctx;
            _prevctx = localctx;

            this.state = 22;
            _la = this._input.LA(1);
            if(!(_la===RuleParser.MINUS || _la===RuleParser.NOT)) {
            this._errHandler.recoverInline(this);
            }
            else {
            	this._errHandler.reportMatch(this);
                this.consume();
            }
            this.state = 23;
            this.expr(23);
            break;

        case 2:
            localctx = new NestedExprContext(this, localctx);
            this._ctx = localctx;
            _prevctx = localctx;
            this.state = 24;
            this.match(RuleParser.T__3);
            this.state = 25;
            this.expr(0);
            this.state = 26;
            this.match(RuleParser.T__4);
            break;

        case 3:
            localctx = new FunctionExprContext(this, localctx);
            this._ctx = localctx;
            _prevctx = localctx;
            this.state = 28;
            this.fn();
            break;

        case 4:
            localctx = new FunctionArrayExprContext(this, localctx);
            this._ctx = localctx;
            _prevctx = localctx;
            this.state = 29;
            this.fn();
            this.state = 32; 
            this._errHandler.sync(this);
            var _alt = 1;
            do {
            	switch (_alt) {
            	case 1:
            		this.state = 30;
            		this.match(RuleParser.T__5);
            		this.state = 31;
            		this.fn();
            		break;
            	default:
            		throw new antlr4.error.NoViableAltException(this);
            	}
            	this.state = 34; 
            	this._errHandler.sync(this);
            	_alt = this._interp.adaptivePredict(this._input,1, this._ctx);
            } while ( _alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER );
            break;

        case 5:
            localctx = new IdentifierExprContext(this, localctx);
            this._ctx = localctx;
            _prevctx = localctx;
            this.state = 36;
            this.match(RuleParser.IDENTIFIER);
            break;

        case 6:
            localctx = new NullExprContext(this, localctx);
            this._ctx = localctx;
            _prevctx = localctx;
            this.state = 37;
            this.match(RuleParser.NULL);
            break;

        case 7:
            localctx = new DoubleExprContext(this, localctx);
            this._ctx = localctx;
            _prevctx = localctx;
            this.state = 38;
            this.match(RuleParser.DOUBLE);
            break;

        case 8:
            localctx = new LongExprContext(this, localctx);
            this._ctx = localctx;
            _prevctx = localctx;
            this.state = 39;
            this.match(RuleParser.LONG);
            break;

        case 9:
            localctx = new BooleanExprContext(this, localctx);
            this._ctx = localctx;
            _prevctx = localctx;
            this.state = 40;
            this.match(RuleParser.BOOLEAN);
            break;

        case 10:
            localctx = new StringExprContext(this, localctx);
            this._ctx = localctx;
            _prevctx = localctx;
            this.state = 41;
            this.match(RuleParser.STRING);
            break;

        case 11:
            localctx = new RegularExprContext(this, localctx);
            this._ctx = localctx;
            _prevctx = localctx;
            this.state = 42;
            this.match(RuleParser.REGEX);
            break;

        case 12:
            localctx = new IdentifierArrayExprContext(this, localctx);
            this._ctx = localctx;
            _prevctx = localctx;
            this.state = 43;
            this.match(RuleParser.IDENTIFIER);
            this.state = 46; 
            this._errHandler.sync(this);
            var _alt = 1;
            do {
            	switch (_alt) {
            	case 1:
            		this.state = 44;
            		this.match(RuleParser.T__5);
            		this.state = 45;
            		this.match(RuleParser.IDENTIFIER);
            		break;
            	default:
            		throw new antlr4.error.NoViableAltException(this);
            	}
            	this.state = 48; 
            	this._errHandler.sync(this);
            	_alt = this._interp.adaptivePredict(this._input,2, this._ctx);
            } while ( _alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER );
            break;

        case 13:
            localctx = new StringArrayExprContext(this, localctx);
            this._ctx = localctx;
            _prevctx = localctx;
            this.state = 50;
            this.match(RuleParser.STRING);
            this.state = 53; 
            this._errHandler.sync(this);
            var _alt = 1;
            do {
            	switch (_alt) {
            	case 1:
            		this.state = 51;
            		this.match(RuleParser.T__5);
            		this.state = 52;
            		this.match(RuleParser.STRING);
            		break;
            	default:
            		throw new antlr4.error.NoViableAltException(this);
            	}
            	this.state = 55; 
            	this._errHandler.sync(this);
            	_alt = this._interp.adaptivePredict(this._input,3, this._ctx);
            } while ( _alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER );
            break;

        case 14:
            localctx = new LongArrayExprContext(this, localctx);
            this._ctx = localctx;
            _prevctx = localctx;
            this.state = 57;
            this.match(RuleParser.LONG);
            this.state = 60; 
            this._errHandler.sync(this);
            var _alt = 1;
            do {
            	switch (_alt) {
            	case 1:
            		this.state = 58;
            		this.match(RuleParser.T__5);
            		this.state = 59;
            		this.match(RuleParser.LONG);
            		break;
            	default:
            		throw new antlr4.error.NoViableAltException(this);
            	}
            	this.state = 62; 
            	this._errHandler.sync(this);
            	_alt = this._interp.adaptivePredict(this._input,4, this._ctx);
            } while ( _alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER );
            break;

        case 15:
            localctx = new DoubleArrayExprContext(this, localctx);
            this._ctx = localctx;
            _prevctx = localctx;
            this.state = 64;
            this.match(RuleParser.DOUBLE);
            this.state = 67; 
            this._errHandler.sync(this);
            var _alt = 1;
            do {
            	switch (_alt) {
            	case 1:
            		this.state = 65;
            		this.match(RuleParser.T__5);
            		this.state = 66;
            		this.match(RuleParser.DOUBLE);
            		break;
            	default:
            		throw new antlr4.error.NoViableAltException(this);
            	}
            	this.state = 69; 
            	this._errHandler.sync(this);
            	_alt = this._interp.adaptivePredict(this._input,5, this._ctx);
            } while ( _alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER );
            break;

        }
        this._ctx.stop = this._input.LT(-1);
        this.state = 103;
        this._errHandler.sync(this);
        var _alt = this._interp.adaptivePredict(this._input,9,this._ctx)
        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
            if(_alt===1) {
                if(this._parseListeners!==null) {
                    this.triggerExitRuleEvent();
                }
                _prevctx = localctx;
                this.state = 101;
                this._errHandler.sync(this);
                var la_ = this._interp.adaptivePredict(this._input,8,this._ctx);
                switch(la_) {
                case 1:
                    localctx = new PowOpExprContext(this, new ExprContext(this, _parentctx, _parentState));
                    this.pushNewRecursionContext(localctx, _startState, RuleParser.RULE_expr);
                    this.state = 73;
                    if (!( this.precpred(this._ctx, 22))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 22)");
                    }
                    this.state = 74;
                    this.match(RuleParser.POW);
                    this.state = 75;
                    this.expr(22);
                    break;

                case 2:
                    localctx = new MulDivModuloExprContext(this, new ExprContext(this, _parentctx, _parentState));
                    this.pushNewRecursionContext(localctx, _startState, RuleParser.RULE_expr);
                    this.state = 76;
                    if (!( this.precpred(this._ctx, 21))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 21)");
                    }
                    this.state = 77;
                    _la = this._input.LA(1);
                    if(!((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << RuleParser.MUL) | (1 << RuleParser.DIV) | (1 << RuleParser.MODULO))) !== 0))) {
                    this._errHandler.recoverInline(this);
                    }
                    else {
                    	this._errHandler.reportMatch(this);
                        this.consume();
                    }
                    this.state = 78;
                    this.expr(22);
                    break;

                case 3:
                    localctx = new AddSubExprContext(this, new ExprContext(this, _parentctx, _parentState));
                    this.pushNewRecursionContext(localctx, _startState, RuleParser.RULE_expr);
                    this.state = 79;
                    if (!( this.precpred(this._ctx, 20))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 20)");
                    }
                    this.state = 80;
                    _la = this._input.LA(1);
                    if(!(_la===RuleParser.MINUS || _la===RuleParser.PLUS)) {
                    this._errHandler.recoverInline(this);
                    }
                    else {
                    	this._errHandler.reportMatch(this);
                        this.consume();
                    }
                    this.state = 81;
                    this.expr(21);
                    break;

                case 4:
                    localctx = new LogicalOpExprContext(this, new ExprContext(this, _parentctx, _parentState));
                    this.pushNewRecursionContext(localctx, _startState, RuleParser.RULE_expr);
                    this.state = 82;
                    if (!( this.precpred(this._ctx, 19))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 19)");
                    }
                    this.state = 83;
                    _la = this._input.LA(1);
                    if(!(((((_la - 24)) & ~0x1f) == 0 && ((1 << (_la - 24)) & ((1 << (RuleParser.LT - 24)) | (1 << (RuleParser.LEQ - 24)) | (1 << (RuleParser.GT - 24)) | (1 << (RuleParser.GEQ - 24)) | (1 << (RuleParser.EQ - 24)) | (1 << (RuleParser.NEQ - 24)) | (1 << (RuleParser.ASSIGN - 24)))) !== 0))) {
                    this._errHandler.recoverInline(this);
                    }
                    else {
                    	this._errHandler.reportMatch(this);
                        this.consume();
                    }
                    this.state = 84;
                    this.expr(20);
                    break;

                case 5:
                    localctx = new LogicalAndOrExprContext(this, new ExprContext(this, _parentctx, _parentState));
                    this.pushNewRecursionContext(localctx, _startState, RuleParser.RULE_expr);
                    this.state = 85;
                    if (!( this.precpred(this._ctx, 18))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 18)");
                    }
                    this.state = 86;
                    _la = this._input.LA(1);
                    if(!(_la===RuleParser.AND || _la===RuleParser.OR)) {
                    this._errHandler.recoverInline(this);
                    }
                    else {
                    	this._errHandler.reportMatch(this);
                        this.consume();
                    }
                    this.state = 87;
                    this.expr(19);
                    break;

                case 6:
                    localctx = new LogicalAndOrExpr2Context(this, new ExprContext(this, _parentctx, _parentState));
                    this.pushNewRecursionContext(localctx, _startState, RuleParser.RULE_expr);
                    this.state = 88;
                    if (!( this.precpred(this._ctx, 17))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 17)");
                    }
                    this.state = 89;
                    _la = this._input.LA(1);
                    if(!(_la===RuleParser.T__1 || _la===RuleParser.T__2)) {
                    this._errHandler.recoverInline(this);
                    }
                    else {
                    	this._errHandler.reportMatch(this);
                        this.consume();
                    }
                    this.state = 90;
                    this.expr(18);
                    break;

                case 7:
                    localctx = new AssignExprContext(this, new ExprContext(this, _parentctx, _parentState));
                    this.pushNewRecursionContext(localctx, _startState, RuleParser.RULE_expr);
                    this.state = 91;
                    if (!( this.precpred(this._ctx, 16))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 16)");
                    }
                    this.state = 92;
                    this.match(RuleParser.ASSIGN);
                    this.state = 93;
                    this.expr(17);
                    break;

                case 8:
                    localctx = new ExprArrayExprContext(this, new ExprContext(this, _parentctx, _parentState));
                    this.pushNewRecursionContext(localctx, _startState, RuleParser.RULE_expr);
                    this.state = 94;
                    if (!( this.precpred(this._ctx, 1))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 1)");
                    }
                    this.state = 97; 
                    this._errHandler.sync(this);
                    var _alt = 1;
                    do {
                    	switch (_alt) {
                    	case 1:
                    		this.state = 95;
                    		this.match(RuleParser.T__5);
                    		this.state = 96;
                    		this.expr(0);
                    		break;
                    	default:
                    		throw new antlr4.error.NoViableAltException(this);
                    	}
                    	this.state = 99; 
                    	this._errHandler.sync(this);
                    	_alt = this._interp.adaptivePredict(this._input,7, this._ctx);
                    } while ( _alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER );
                    break;

                } 
            }
            this.state = 105;
            this._errHandler.sync(this);
            _alt = this._interp.adaptivePredict(this._input,9,this._ctx);
        }

    } catch( error) {
        if(error instanceof antlr4.error.RecognitionException) {
	        localctx.exception = error;
	        this._errHandler.reportError(this, error);
	        this._errHandler.recover(this, error);
	    } else {
	    	throw error;
	    }
    } finally {
        this.unrollRecursionContexts(_parentctx)
    }
    return localctx;
};


function FnContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = RuleParser.RULE_fn;
    return this;
}

FnContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
FnContext.prototype.constructor = FnContext;

FnContext.prototype.IDENTIFIER = function() {
    return this.getToken(RuleParser.IDENTIFIER, 0);
};

FnContext.prototype.fnArgs = function() {
    return this.getTypedRuleContext(FnArgsContext,0);
};

FnContext.prototype.accept = function(visitor) {
    if ( visitor instanceof RuleVisitor ) {
        return visitor.visitFn(this);
    } else {
        return visitor.visitChildren(this);
    }
};




RuleParser.FnContext = FnContext;

RuleParser.prototype.fn = function() {

    var localctx = new FnContext(this, this._ctx, this.state);
    this.enterRule(localctx, 6, RuleParser.RULE_fn);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 106;
        this.match(RuleParser.IDENTIFIER);
        this.state = 107;
        this.match(RuleParser.T__3);
        this.state = 109;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        if((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << RuleParser.T__3) | (1 << RuleParser.BOOLEAN) | (1 << RuleParser.IDENTIFIER) | (1 << RuleParser.NULL) | (1 << RuleParser.LONG) | (1 << RuleParser.DOUBLE) | (1 << RuleParser.STRING) | (1 << RuleParser.REGEX) | (1 << RuleParser.MINUS) | (1 << RuleParser.NOT))) !== 0)) {
            this.state = 108;
            this.fnArgs();
        }

        this.state = 111;
        this.match(RuleParser.T__4);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};


function FnArgsContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = RuleParser.RULE_fnArgs;
    return this;
}

FnArgsContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
FnArgsContext.prototype.constructor = FnArgsContext;


 
FnArgsContext.prototype.copyFrom = function(ctx) {
    antlr4.ParserRuleContext.prototype.copyFrom.call(this, ctx);
};


function FunctionArgsContext(parser, ctx) {
	FnArgsContext.call(this, parser);
    FnArgsContext.prototype.copyFrom.call(this, ctx);
    return this;
}

FunctionArgsContext.prototype = Object.create(FnArgsContext.prototype);
FunctionArgsContext.prototype.constructor = FunctionArgsContext;

RuleParser.FunctionArgsContext = FunctionArgsContext;

FunctionArgsContext.prototype.expr = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ExprContext);
    } else {
        return this.getTypedRuleContext(ExprContext,i);
    }
};
FunctionArgsContext.prototype.accept = function(visitor) {
    if ( visitor instanceof RuleVisitor ) {
        return visitor.visitFunctionArgs(this);
    } else {
        return visitor.visitChildren(this);
    }
};



RuleParser.FnArgsContext = FnArgsContext;

RuleParser.prototype.fnArgs = function() {

    var localctx = new FnArgsContext(this, this._ctx, this.state);
    this.enterRule(localctx, 8, RuleParser.RULE_fnArgs);
    var _la = 0; // Token type
    try {
        localctx = new FunctionArgsContext(this, localctx);
        this.enterOuterAlt(localctx, 1);
        this.state = 113;
        this.expr(0);
        this.state = 118;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===RuleParser.T__5) {
            this.state = 114;
            this.match(RuleParser.T__5);
            this.state = 115;
            this.expr(0);
            this.state = 120;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};


RuleParser.prototype.sempred = function(localctx, ruleIndex, predIndex) {
	switch(ruleIndex) {
	case 2:
			return this.expr_sempred(localctx, predIndex);
    default:
        throw "No predicate with index:" + ruleIndex;
   }
};

RuleParser.prototype.expr_sempred = function(localctx, predIndex) {
	switch(predIndex) {
		case 0:
			return this.precpred(this._ctx, 22);
		case 1:
			return this.precpred(this._ctx, 21);
		case 2:
			return this.precpred(this._ctx, 20);
		case 3:
			return this.precpred(this._ctx, 19);
		case 4:
			return this.precpred(this._ctx, 18);
		case 5:
			return this.precpred(this._ctx, 17);
		case 6:
			return this.precpred(this._ctx, 16);
		case 7:
			return this.precpred(this._ctx, 1);
		default:
			throw "No predicate with index:" + predIndex;
	}
};


exports.RuleParser = RuleParser;
