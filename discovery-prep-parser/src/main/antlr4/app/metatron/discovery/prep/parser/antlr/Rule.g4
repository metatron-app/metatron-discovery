/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

grammar Rule ;

ruleset : RULE_NAME args*
        ;

args : ARG_NAME ':' expr
     ;

expr : ('-'|'!') expr                                 # unaryOpExpr
     | <assoc=right> expr '^' expr                    # powOpExpr
     | expr ('*'|'/'|'%') expr                        # mulDivModuloExpr
     | expr ('+'|'-') expr                            # addSubExpr
     | expr ('<'|'<='|'>'|'>='|'=='|'!=' | '=') expr  # logicalOpExpr
     | expr ('&&'|'||') expr                          # logicalAndOrExpr
     | expr ('&'|'|') expr                            # logicalAndOrExpr2
     | expr '=' expr                                  # assignExpr
     | '(' expr ')'                                   # nestedExpr
     | fn                                             # functionExpr
     | fn (',' fn)+                                   # functionArrayExpr
     | IDENTIFIER                                     # identifierExpr
     | NULL                                           # nullExpr
     | DOUBLE                                         # doubleExpr
     | LONG                                           # longExpr
     | BOOLEAN                                        # booleanExpr
     | STRING                                         # stringExpr
     | REGEX                                          # regularExpr
     | IDENTIFIER (',' IDENTIFIER)+                   # identifierArrayExpr
     | STRING (',' STRING)+                           # stringArrayExpr
     | LONG (',' LONG)+                               # longArrayExpr
     | DOUBLE (',' DOUBLE)+                           # doubleArrayExpr
     ;
fn : IDENTIFIER '(' fnArgs? ')'
   ;
fnArgs : expr (',' expr)*                             # functionArgs
       ;

WS : [ \t\r\n]+ -> skip ;
RULE_NAME : ('drop' | 'header' | 'settype' | 'rename' | 'keep' | 'set' | 'derive' | 'replace' | 'countpattern' | 'split' | 'delete' | 'pivot' | 'unpivot' | 'extract' | 'flatten' | 'merge' | 'nest' | 'unnest' | 'join' | 'aggregate' | 'splitrows' | 'move' | 'sort' | 'union' | 'window' | 'setformat');
ARG_NAME : ('col' | 'row' | 'type' | 'rownum' | 'to' | 'value' | 'as' | 'on' | 'after' | 'before' | 'global' | 'with' | 'ignoreCase' | 'limit' | 'quote' | 'group' | 'groupEvery' | 'into' | 'markLineage' | 'pluck' | 'leftSelectCol' | 'rightSelectCol' | 'condition' | 'joinType' | 'idx' | 'dataset2' | 'order' | 'masterCol' | 'slaveCol' | 'totalCol' | 'partition' | 'rowsBetween' | 'pattern' | 'format');
BOOLEAN : ('true' | 'false');
IDENTIFIER : [_$a-zA-Z\u0080-\uFFFF][._$a-zA-Z0-9\[\]\u0080-\uFFFF]* [~]* [_$a-zA-Z\u0080-\uFFFF]*[._$a-zA-Z0-9\[\]\u0080-\uFFFF]* | '`' ~[`]+ '`';
/*
IDENTIFIER : [_$a-zA-Z\uAC00-\uD7AF][._$a-zA-Z0-9\[\]\uAC00-\uD7AF]* [~]* [_$a-zA-Z\uAC00-\uD7AF]*[._$a-zA-Z0-9\[\]\uAC00-\uD7AF]* | '"' ~["]+ '"';
*/
NULL : 'null';
LONG : [0-9]+ ;
DOUBLE : [0-9]+ '.' [0-9]* ;
STRING : '\'' (ESC | ~ [\'\\])* '\'';
REGEX : ':' [ ]* '/' (ESC | ~ [\'/])* '/';
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
