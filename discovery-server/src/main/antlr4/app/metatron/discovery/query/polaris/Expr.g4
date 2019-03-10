grammar Expr;

expr : ('-'|'!') expr                                 # unaryOpExpr
     |<assoc=right> expr '^' expr                     # powOpExpr
     | expr ('*'|'/'|'%') expr                        # mulDivModuloExpr
     | expr ('+'|'-') expr                            # addSubExpr
     | expr ('<'|'<='|'>'|'>='|'=='|'!=') expr        # logicalOpExpr
     | expr ('&&'|'||') expr                          # logicalAndOrExpr
     | expr ('&'|'|') expr                            # logicalAndOrExpr2
     | expr '=' expr                                  # assignExpr
     | '(' expr ')'                                   # nestedExpr
     | IDENTIFIER '(' fnArgs? ')'                     # functionExpr
     | IDENTIFIER                                     # identifierExpr
     | IDENTIFIER '[' LONG ']'                        # identifierExpr
     | DOUBLE                                         # doubleExpr
     | LONG                                           # longExpr
     | STRING                                         # string
     | idArray                                        # idArrayExpr
     ;

fnArgs : expr (',' expr)*                             # functionArgs
       ;

field :  IDENTIFIER                                   # idfield
      ;

idArray  : '{' field (',' field)* '}'                 # identifierArray
         | '{' '}'                                    # emptyArray
         ;


IDENTIFIER : [_$a-zA-Z\uAC00-\uD7AF][._$a-zA-Z0-9\[\]\uAC00-\uD7AF]* | '"' ~["]+ '"';
LONG : [0-9]+ ;
DOUBLE : [0-9]+ '.' [0-9]* ;
WS : [ \t\r\n]+ -> skip ;

STRING : '\'' (ESC | ~ [\'\\])* '\'';
fragment ESC : '\\' ([\'\\/bfnrt] | UNICODE) ;
fragment UNICODE : 'u' HEX HEX HEX HEX ;
fragment HEX : [0-9a-fA-F] ;

MINUS : '-' ;
NOT : '!' ;
POW : '^' ;
MUL : '*' ;
DIV : '/' ;
MODULO : '%' ;
PLUS : '+' ;
LT : '<' ;
LEQ : '<=' ;
GT : '>' ;
GEQ : '>=' ;
EQ : '==' ;
NEQ : '!=' ;
AND : '&&' ;
OR : '||' ;
ASSIGN : '=' ;
