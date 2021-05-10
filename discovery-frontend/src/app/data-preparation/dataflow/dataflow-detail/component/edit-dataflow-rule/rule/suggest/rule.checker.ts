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


