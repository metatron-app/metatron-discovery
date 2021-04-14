import {CommonTokenStream, InputStream} from 'antlr4';

import {RuleLexer} from '../antlr4/RuleLexer';
import {RuleParser} from '../antlr4/RuleParser';
import {RuleErrorListener, RuleLexerErrorListener} from './RuleErrorListener';

export interface TokenInfo {
  text: string;

  /* rule에서 토큰 시작 번호 */
  start: number;

  /* rule에서 토큰 먼추는 번호 */
  stop: number;

  /* 토큰 타압 */
  type: number;

  /* 토큰의 배열 순서 */
  tokenIndex: number;

  /* 에러 시작 토큰 */
  isStart: boolean;

  /* 에러 발생한 토큰 <EOF> 일 수 있다 */
  isError: boolean;

}

export interface ParseInfo {
  ruleString: string;

  /** 전체 토큰 목록  */
  tokens: TokenInfo[];

  /* rule string에서 에러 시작 문자열 index */
  errorStartIndex: number;

  /* lexer 에러 발생 여부 */
  lexerError: boolean;

  /* 에러 시작 토큰 인덱스 */
  startIndex: number;

  /* 에러 발생 토큰 인덱스 */
  offenceIndex: number;

  /* 다음에 올수 있는 토큰 목록 */
  expectedList: number[];

  /* 마지막 문자열까지 파싱했는지 여부, false: 에러일 가능성이 있음 expr(, expr) */
  fetchedEOF: boolean;

  /* 에러 발생 여부 */
  existError: boolean;
}


export class RuleChecker {

  constructor() {
  }

  parse(ruleString: string): ParseInfo {
    // let ruleString = 'keep on: sum( abc , col: ddd  ';

    const inputStream = new InputStream(ruleString);
    // let lexer = new RuleLexer(inputStream); /* Only a void function can be called with the 'new' keyword.*/
    const lexer = new RuleLexer(inputStream);

    lexer.removeErrorListeners();
    const roleLexerErrorListener = new RuleLexerErrorListener();
    lexer.addErrorListener(roleLexerErrorListener);

    const tokenStream = new CommonTokenStream(lexer);
    // let parser = new RuleParser(tokenStream); /* Only a void function can be called with the 'new' keyword.*/
    const parser = new RuleParser(tokenStream);
    parser.buildParseTrees = false;

    // parser._errHandler = new RuleErrorStrategy() ;
    parser.removeErrorListeners();
    const roleErrorListener = new RuleErrorListener();
    parser.addErrorListener(roleErrorListener);

    // let tree = parser.ruleset();
    // let tree = parser.args();

    const fetchedEOF = parser.getTokenStream().fetchedEOF;

    const tokens = parser.getTokenStream().tokens;

    // let voca = parser.symbolicNames[6];
    const parseInfo = this.getParseInfo(ruleString, tokens, roleErrorListener);

    parseInfo.fetchedEOF = fetchedEOF;

    if (roleLexerErrorListener.isError()) {
      parseInfo.errorStartIndex = roleLexerErrorListener.getStartIndex();
      parseInfo.lexerError = true;
    }

    return parseInfo;
  }

  /**
   * 파싱 정보 생성
   * @param ruleStr
   * @param tokens
   * @param el
   */
  private getParseInfo(ruleStr: string, tokens, el: RuleErrorListener): ParseInfo {

    const startIndex = el.getStartIndex();
    const offenceIndex = el.getOffenceIndex();

    const tokenInfos = [];

    if (tokens && tokens.length > 0) {
      const length = tokens.length;
      for (let i = 0; i < length; i++) {
        const t = tokens[i];
        if (-1 === t.type) {
          continue;
        }

        const isStart = startIndex === i;
        const isError = offenceIndex === i;

        tokenInfos.push({
          text: t.text,
          start: t.start,
          stop: t.stop,
          type: t.type,
          tokenIndex: t.tokenIndex,
          isStart: isStart,
          isError: isError
        });
      }
    }

    return {
      ruleString: ruleStr,
      tokens: tokenInfos,
      errorStartIndex: -1,
      startIndex: startIndex,
      offenceIndex: offenceIndex,
      expectedList: el.getExpectedList(),
      existError: el.isError(),
      fetchedEOF: false,
      lexerError: false
    }

  }
}


