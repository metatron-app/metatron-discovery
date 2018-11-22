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

grammar PrepRule ;

WS: (' '|'\r'|'\n'|'\t')+ -> skip;

COMPLETED_BRACKET_KEYWD: '@_COMPLETED_BRACKET_@';
COLUMN_NAME_KEYWD: '@_COLUMN_NAME_@';
VALUE_ARGUMENT_KEYWD: '@_VALUE_ARGUMENT_@';
FUNCTION_EXPRESSION_KEYWD: '@_FUNCTION_EXPRESSION_@';
STRING_KWD: '@_STRING_@';

test_window_expression: (
                            'count' '(' ')'
                         | 'sum' '(' COLUMN_NAME_KEYWD ')'
                         | 'avg' '(' COLUMN_NAME_KEYWD ')'
                         | 'min' '(' COLUMN_NAME_KEYWD ')'
                         | 'max' '(' COLUMN_NAME_KEYWD ')'
                         | 'row_number' '(' ')'
                         | 'rolling_sum' '(' COLUMN_NAME_KEYWD ',' LONG ',' LONG ')'
                         | 'rolling_avg' '(' COLUMN_NAME_KEYWD ',' LONG ',' LONG ')'
                         | 'lag' '(' COLUMN_NAME_KEYWD ',' LONG ')'
                         | 'lead' '(' COLUMN_NAME_KEYWD ',' LONG ')'
                         )
                         ;

test_aggregate_expression: (
                            'count' '(' ')'
                         | 'sum' '(' COLUMN_NAME_KEYWD ')'
                         | 'avg' '(' COLUMN_NAME_KEYWD ')'
                         | 'min' '(' COLUMN_NAME_KEYWD ')'
                         | 'max' '(' COLUMN_NAME_KEYWD ')'
                         )
                         ;

test_condition_expression: test_left_value ('<'|'<='|'>'|'>='|'=='|'!='|'&&'|'||'|'+'|'-'|'*'|'/') test_right_value ;

test_left_value : COMPLETED_BRACKET_KEYWD
            | COLUMN_NAME_KEYWD
            | FUNCTION_EXPRESSION_KEYWD
            | STRING_KWD
            | LONG
            | DOUBLE
            | BOOLEAN
            ;


test_right_value : COMPLETED_BRACKET_KEYWD
            | COLUMN_NAME_KEYWD
            | FUNCTION_EXPRESSION_KEYWD
            | STRING_KWD
            | LONG
            | DOUBLE
            | BOOLEAN
            ;

sub_condition_expression : '(' sub_condition_complete_expression ')'
                     | sub_condition_complete_expression ('&&'|'||') sub_condition_complete_expression;

sub_condition_complete_expression : sub_condition_expression_argument ('<'|'<='|'>'|'>='|'=='|'!=') sub_condition_expression_argument ;

sub_condition_expression_argument: sub_value_expression
                                 | '(' sub_value_expression ')' ;

sub_value_expression: function_expression
                  | FUNCTION_EXPRESSION_KEYWD
                  | COLUMN_NAME_KEYWD
                  | VALUE_ARGUMENT_KEYWD
                  | STRING_KWD
                  | LONG
                  | DOUBLE
                  ;

function_expression: FUNCTION_NAMES '(' ANY* ')';


FUNCTION_PARAMETERS: [a-z]+;

FUNCTION_NAMES : N O W
                | M O N T H
                | D A Y
                | H O U R
                | M I N U T E
                | S E C O N D
                | M I L L I S E C O N D
                | I F
                | I S N U L L
                | I S N A N
                | L E N G T H
                | T R I M
                | L T R I M
                | R T R I M
                | U P P E R
                | L O W E R
                | L E F T
                | R I G H T
                | S U B S T R I N G
                | A D D '_' T I M E
                | C O N C A T
                | C O N C A T '_' W S
                | M A T H '.' ( A B S | A C O S | A S I N | A T A N | C B R T | C E I L | C O S | C O S H | E X P | E X P M '1' | G E T E X P O N E N T | R O U N D | S I G N U M | S I N | S I N H | S Q R T | T A N | T A N H )
                ;

function_param_0 : 'now' '(' ')';
function_param_1 : ('now'|'month'|'day'|'hour'|'minute'|'second'|'millisecond'
                |'if'|'isnull'|'isnan'|'length' | 'trim'|'ltrim'|'rtrim'|'upper'|'lower'
                |'math.abs'| 'math.acos'| 'math.asin'| 'math.atan'| 'math.cbrt'| 'math.ceil'| 'math.cos'| 'math.cosh'
                | 'math.exp'| 'math.expm1'| 'math.getExponent'| 'math.round'| 'math.signum'| 'math.sin'| 'math.sinh'
                | 'math.sqrt'| 'math.tan'| 'math.tanh' ) '(' sub_value_expression ')'
                ;
function_param_2 : ( 'left' | 'right' );
function_param_3 : ('if'|'substring'|'add_time') ;
function_param_n : ('concat'|'concat_ws') ;

function_name_aggregate : 'sum'|'avg'|'max'|'min'|'count';
function_name_0 : 'now';
function_name_1 : 'now'|'month'|'day'|'hour'|'minute'|'second'|'millisecond'
                |'if'|'isnull'|'isnan'|'length' | 'trim'|'ltrim'|'rtrim'|'upper'|'lower'
                |'math.abs'| 'math.acos'| 'math.asin'| 'math.atan'| 'math.cbrt'| 'math.ceil'| 'math.cos'| 'math.cosh'
                | 'math.exp'| 'math.expm1'| 'math.getExponent'| 'math.round'| 'math.signum'| 'math.sin'| 'math.sinh'
                | 'math.sqrt'| 'math.tan'| 'math.tanh'
                ;
function_name_2 : 'left' | 'right' ;
function_name_3 : 'if'|'substring'|'add_time' ;
function_name_n : 'concat'|'concat_ws' ;


rule_header: RULE_HEADER_KEYWD arg_rownum;
rule_keep: RULE_KEEP_KEYWD arg_row;

arg_row: ARG_ROW_KEYWD ARG_SPLITTER parameter_row;
arg_rownum: ARG_ROWNUM_KEYWD ARG_SPLITTER parameter_rownum ;

parameter_row: expression_row_condition ;
parameter_rownum: LONG ;

expression_row_condition: sub_condition_expression;
//expression_row_condition: expression_condition ;

expression_condition : '(' expression_condition ')'
                     | expression_condition ('&&'|'||') expression_condition
                     | expression_condition_argument ('<'|'<='|'>'|'>='|'=='|'!=') expression_condition_argument ;

expression_condition_argument : expression_value ;

expression_value : column_name
                  | function_form
                  | LONG
                  | DOUBLE
                  | NULL
                  | STRING ;

function_form : FUNCTION_NAME '(' expression_value ')'
                | FUNCTION_NAME '(' expression_value ')'
                | FUNCTION_NAME '(' expression_value ',' expression_value ')'
                | FUNCTION_NAME '(' expression_value ',' expression_value ',' expression_value ')'
                ;

column_name: IDENTIFIER;

FUNCTION_NAME : FUNCTION_LENGTH
              | FUNCTION_LEFT
              | FUNCTION_RIGHT
              | FUNCTION_TRIM
              | FUNCTION_SUBSTRING
              ;

FUNCTION_LENGTH: L E N G T H;
FUNCTION_LEFT: L E F T;
FUNCTION_RIGHT: R I G H T;
FUNCTION_TRIM: T R I M;
FUNCTION_SUBSTRING: S U B S T R I N G;

RULE_KEEP_KEYWD: K E E P ;
RULE_HEADER_KEYWD: H E A D E R ;

ARG_ROW_KEYWD: R O W;
ARG_ROWNUM_KEYWD: R O W N U M;
ARG_SPLITTER: ':';


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

RULE_NAME : ('drop' | 'header' | 'settype' | 'rename' | 'keep' | 'set' | 'derive' | 'replace' | 'countpattern' | 'split' | 'delete' | 'pivot' | 'unpivot' | 'extract' | 'flatten' | 'merge' | 'nest' | 'unnest' | 'join' | 'aggregate' | 'splitrows' | 'move' | 'sort' | 'union' | 'window');
ARG_NAME : ('col' | 'row' | 'type' | 'rownum' | 'to' | 'value' | 'as' | 'on' | 'after' | 'before' | 'global' | 'with' | 'ignoreCase' | 'limit' | 'quote' | 'group' | 'groupEvery' | 'into' | 'markLineage' | 'pluck' | 'leftSelectCol' | 'rightSelectCol' | 'condition' | 'joinType' | 'idx' | 'dataset2' | 'order' | 'masterCol' | 'slaveCol' | 'totalCol' | 'partition' | 'rowsBetween' | 'pattern' | 'format');
BOOLEAN : ('true' | 'false');
IDENTIFIER : [_$a-zA-Z\uAC00-\uD7AF][._$a-zA-Z0-9\[\]\uAC00-\uD7AF]* [~]* [_$a-zA-Z\uAC00-\uD7AF]*[._$a-zA-Z0-9\[\]\uAC00-\uD7AF]* | '"' ~["]+ '"';
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

fragment A : [aA];
fragment B : [bB];
fragment C : [cC];
fragment D : [dD];
fragment E : [eE];
fragment F : [fF];
fragment G : [gG];
fragment H : [hH];
fragment I : [iI];
fragment J : [jJ];
fragment K : [kK];
fragment L : [lL];
fragment M : [mM];
fragment N : [nN];
fragment O : [oO];
fragment P : [pP];
fragment Q : [qQ];
fragment R : [rR];
fragment S : [sS];
fragment T : [tT];
fragment U : [uU];
fragment V : [vV];
fragment W : [wW];
fragment X : [xX];
fragment Y : [yY];
fragment Z : [zZ];

ANY : . ;