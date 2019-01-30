import {InputStream, Lexer} from 'antlr4';

export declare class RuleLexer extends Lexer {
  channelNames: string[];
  modeNames: string[];
  literalNames: string[];
  symbolicNames: string[];
  ruleNames: string[];
  grammarFileName: string;

  constructor(input: InputStream);

  addErrorListener(listener);
  
  removeErrorListeners(): void;
}
