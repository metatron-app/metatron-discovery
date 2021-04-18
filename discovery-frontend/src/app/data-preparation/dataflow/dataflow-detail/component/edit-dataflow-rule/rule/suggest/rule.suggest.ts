import {ParseInfo, TokenInfo} from './rule.checker';
import {Field} from '@domain/data-preparation/pr-dataset';

export interface FuncInfo {

  /** name */
  name: string;

  /** argument count */
  argCount: number;

  /** function type  */
  type: string;

}

export interface SuggestItem {
  value: string;

  title: string;

  /** func, column  */
  type: string;
}


export class RuleSuggest {

  private funcAllNames: string[] = [];

  private funcCommonNames: string[] = [
    'contains', 'startswith', 'endswith', 'add_time', 'concat',
    'concat_ws', 'day', 'hour', 'if', 'ismismatched', 'isnan', 'isnull',
    'length', 'lower', 'ltrim',
    'math.abs', 'math.acos', 'math.asin', 'math.atan', 'math.cbrt',
    'math.ceil', 'math.cos', 'math.cosh', 'math.exp', 'math.expm1',
    'math.getExponent', 'math.round', 'math.signum', 'math.sin',
    'math.sinh', 'math.sqrt', 'math.tan', 'math.tanh', 'millisecond',
    'minute', 'month', 'now', 'rtrim', 'second', 'substring',
    'time_diff', 'timestamp', 'trim', 'upper', 'year'
  ];

  private funcAggrNames: string[] = [
    'sum', 'avg', 'max', 'min', 'count'
  ];

  private funcWindowNames: string[] = [
    'row_number', 'rolling_sum', 'rolling_avg', 'lag', 'lead', 'sum', 'avg', 'max', 'min', 'count'
  ];

  /** 컬럼 이름 목록 */
  private columnNameList: string[] = [];

  /** 대소문자 구분 여부 */
  private caseSensitive = false;

  /** 컬럼 이름 목록 */
  private columnList: any[] = [];

  constructor() {

    this.initFunction();
  }

  /**
   * init Fucntion
   */
  private initFunction() {
    //  copy to allFuncNames
    this.funcCommonNames.forEach(val => this.funcAllNames.push(val));
    this.funcAggrNames.forEach(val => {
      if (this.funcAllNames.indexOf(val) === -1) {
        this.funcAllNames.push(val);
      }
    });
    this.funcWindowNames.forEach(val => {
      if (this.funcAllNames.indexOf(val) === -1) {
        this.funcAllNames.push(val);
      }
    });

    /* 정렬 */
    this.funcCommonNames.sort();
    this.funcAggrNames.sort();
    this.funcWindowNames.sort();
    this.funcAllNames.sort();

  }

  /**
   * 컬럼 이름을 설정한다.
   * @param list
   */
  public setColumnList(list: Field[]) {
    if (list) {
      this.columnList = list;
    } else {
      this.columnList = [];
    }

    /** 이름만 입력 */
    this.columnNameList = this.columnList.map(col => col.name).sort();
  }

  /**
   * 함수가 parameter를 Column만 가지는 경우 (window, aggregate, pivot)
   * @param funcName 함수 이름
   */
  public isColumnParamFunc(funcName: string) {
    return this.funcAggrNames.indexOf(funcName) !== -1 || this.funcWindowNames.indexOf(funcName) !== -1;
  }

  // /**
  //  * 파싱 정보를 가져온다.
  //  * @param source
  //  */
  // public getParseInfo(source: string): ParseInfo {
  //   return this.ruleChecker.parse(source);
  // }

  /**
   * 토큰 목록을 가져온다.
   * @param tokenInfo
   * @param _poz
   * @param funcType
   * @param columnType
   */
  public getList(tokenInfo: TokenInfo, _poz: number, funcType: string = 'all', columnType: string = 'all'): SuggestItem[] {

    if (!tokenInfo || !tokenInfo.text) {
      return [];
    }

    /*
    let txt = tokenInfo.text;
    if(txt && txt.length > 0) {
        txt = txt.replace(/['`]/g,'');
    }
    */

    let txt = tokenInfo.text.trim();

    if (txt.startsWith('\'')) {
      // 문자열 이면 작은 따움표 '
      return [];
    } else if (txt.startsWith('`')) {
      // 컬럼 목록 backtick `
      txt = txt.replace(/[`]/g, '');
      return this.getColumnList(txt);
    } else {
      let funcList = [];
      let columnList = [];
      if ('no' !== funcType) {
        funcList = this.getFuncList(txt, funcType);
      }

      if ('no' !== columnType) {
        columnList = this.getColumnList(txt, columnType);
      }

      return funcList.concat(columnList);

    }
  }

  /**
   * 현재 포지션이 파라미터일때 앞의 function 이름
   * @param tokens
   * @param poz
   */
  public getParentFuction(tokens: TokenInfo[], poz: number): string {

    const length = tokens.length;
    let index = -1;
    for (let i = 0; i < length; i++) {
      if (tokens[i].start <= poz && poz <= tokens[i].stop) {
        // 커서 포지션이 있는 토큰 정보
        index = i;
        break;
      }
    }

    if (index === -1) {
      // -1 이면 에러로 마지막 문자열
      index = length;
    }

    if (index - 2 < 0) {
      // token의 개수가 2보다 적으면
      return '';
    }

    const preToken = tokens[index - 1];
    if (preToken.text === '(') {
      const funcToken = tokens[index - 2];
      if (funcToken.type === 11) {
        // 함수 이름
        return funcToken.text;
      }
    }

    return '';
  }

  /**
   * 함수가 컬럼 이름만 파라미터로 취하는지 여부
   * @param funcName
   */
  public isOnlyColumnName(funcName: string): boolean {

    if (!funcName) {
      return false;
    }

    const fName = funcName.toLocaleLowerCase();

    if (this.funcAggrNames.indexOf(fName) !== -1) {
      return true;
    }

    if (this.funcWindowNames.indexOf(fName) !== -1) {
      return true;
    }

    return false;
  }

  /**
   * 현재 포지션이 속해있는 토큰 정보
   * @param parseInfo
   * @param poz
   */
  public getPozToken(parseInfo: ParseInfo, poz: number): TokenInfo {

    let retToken;

    if (parseInfo.lexerError) {
      // lexer 에러 있으면

      const ruleString = parseInfo.ruleString;
      const index = parseInfo.errorStartIndex;
      retToken = {
        text: ruleString.substring(index),
        start: index,
        stop: ruleString.length - 1,
        type: -1,
        tokenIndex: -1,
        isStart: true,
        isError: true
      }
    } else {

      const tokens = parseInfo.tokens;

      if (tokens && tokens.length > 0) {

        const length = tokens.length;
        for (let i = 0; i < length; i++) {
          if (tokens[i].start <= poz && poz <= tokens[i].stop) {
            // 커서 포지션이 있는 토큰 정보
            retToken = Object.assign({}, tokens[i]);
            break;
          }
        }

        if (!retToken && length > 0) {
          const lastToken = tokens[length - 1];

          if (lastToken.start < poz && lastToken.stop < poz) {
            // 마지막 토큰의 길이가 poz 보다 적으면 파싱 에러
            retToken = null;
          } else {
            retToken = Object.assign({}, lastToken);
          }

        }
      }
    }

    return retToken;
  }

  /**
   * 함수 목록을 돌려준다.
   * @param prefix 함수 시작이름
   * @param type   타입(all, common, aggr, window )
   */
  public getFuncList(prefix: string = '', type: string = 'all'): SuggestItem[] {

    if ('no' === type) {
      return [];
    }

    let list = this.funcAllNames;
    if ('aggr' === type) {
      list = this.funcAggrNames;
    } else if ('window' === type) {
      list = this.funcWindowNames;
    } else if ('common' === type) {
      list = this.funcCommonNames;
    }

    if (this.caseSensitive) {
      // 대소문자 구분 하면
      return list.filter(v => v.startsWith(prefix))
        .map(v => {
          return {value: v, title: v, type: 'func'}
        });
    } else {
      const lowerPrefix = prefix.toLocaleLowerCase();
      return list.filter(v => v.toLocaleLowerCase().startsWith(lowerPrefix))
        .map(v => {
          return {value: v, title: v, type: 'func'}
        });
    }
  }

  /**
   * 컬럼 이름 목록
   * @param prefix 시작 문자열
   * @param type
   */
  public getColumnList(prefix: string = '', type: string = 'all'): SuggestItem[] {
    if ('no' === type) {
      return [];
    }

    const list = this.columnNameList;

    if (this.caseSensitive) {
      // 대소문자 구분 하면
      return list.filter(name => name.startsWith(prefix))
        .map(name => {
          return {value: name, title: name, type: 'column'}
        });
    } else {
      const lowerPrefix = prefix.toLocaleLowerCase();

      return list.filter(name => name.toLocaleLowerCase().startsWith(lowerPrefix))
        .map(name => {
          return {value: name, title: name, type: 'column'}
        });
    }

  }

}


