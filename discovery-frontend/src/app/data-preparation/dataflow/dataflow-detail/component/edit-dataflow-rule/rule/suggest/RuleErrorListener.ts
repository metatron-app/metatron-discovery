import {ErrorListener} from 'antlr4/error/ErrorListener';
import {BailErrorStrategy} from 'antlr4/error'

export class RuleLexerErrorListener extends ErrorListener {

  /** 에러 라인 번호   */
  private line = -1;

  /* rule string에서 에러 시작 문자열 index */
  private startIndex: number = -1;

  /* 에러 발생 여부 */
  private existError = false;

  constructor() {
    super();
  }

  public getLine() {
    return this.line;
  }

  public getStartIndex(): number {
    return this.startIndex;
  }

  public isError(): boolean {
    return this.existError;
  }

  syntaxError(_recognizer, _offendingSymbol, line, column, _msg, _e) {
    this.existError = true;

    this.line = line;

    this.startIndex = column;
  };
}

export class RuleErrorListener extends ErrorListener {

  /** 전체 토큰 목록  */
  private tokens = [];

  /* 시작 토큰 인덱스 */
  private startIndex: number = -1;

  /* 에러 발생 토큰 인덱스 */
  private offenceIndex: number = -1;

  /* 다음에 올수 있는 토큰 목록 */
  private expectedList: number[] = [];

  /* 에러 발생 여부 */
  private existError = false;

  constructor() {
    super();
  }

  public getTokens() {
    return this.tokens;
  }

  public getStartIndex(): number {
    return this.startIndex;
  }

  public getOffenceIndex(): number {
    return this.offenceIndex;
  }

  public getExpectedList(): number[] {
    return this.expectedList;
  }

  public isError(): boolean {
    return this.existError;
  }

  syntaxError(recognizer, _offendingSymbol, _line, _column, _msg, e) {
    this.existError = true;

    const parser = recognizer._ctx.parser;
    const tokens = parser.getTokenStream().tokens;

    // last token is always "fake" EOF token
    if (tokens != null) {
      this.tokens = tokens;
    }

    const intervals = recognizer.getExpectedTokens();

    // let intervals = recognizer.getExpectedTokensWithinCurrentRule();

    if (e) {
      if (e.offendingToken) {
        this.offenceIndex = e.offendingToken.tokenIndex;
      }

      if (e.startToken) {
        this.startIndex = e.startToken.tokenIndex;
      }
    }

    if (intervals) {
      intervals.intervals.forEach(inter => {
        for (let i = inter.start; i <= inter.stop; i++) {
          if (this.expectedList.indexOf(i) === -1) {
            this.expectedList.push(i);
          }
        }
      });
    }
    /*
    if (tokens.length > 1) {
        var lastToken = tokens[tokens.length - 2],
            tokenType = parser.symbolicNames[lastToken.type];

        tokenType = tokenType;
        if (typeAssistTokens.indexOf(tokenType) >= 0) {
            this.partialFruit = lastToken.text;
        }
    }
    */
  };


}

/*
0: Interval {start: 5, stop: 6}
1: Interval {start: 7, stop: 12}
2: Interval {start: 11, stop: 14}
3: Interval {start: 14, stop: 16}
4: Interval {start: 32, stop: 33}
*/


export class RuleErrorStrategy extends BailErrorStrategy {
  constructor() {
    super();
  }

  public recover(recognizer, e) {

    let context = recognizer._ctx;
    while (context !== null) {
      context.exception = e;
      context = context.parentCtx;
    }

    // throw new ParseCancellationException(e);
  }

  public recoverInline(_recognizer) {
    // this.recover(recognizer, new InputMismatchException(recognizer));
    // new InputMismatchException(recognizer);
  }

  public sync(_recognizer) {
    // pass
  }

}

