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

import * as $ from 'jquery';

export class StringUtil {

  //////////////////////////////////////////////////
  //
  // String 관련 유틸
  //
  //////////////////////////////////////////////////

  /**
   * 파라미터 자리수 만큼의 난수를 생성한다.
   * @param {number} length : 자리수
   * @return {string}
   */
  public static random(length: number): string {

    let str = '';

    const randomStr =
      'a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z'
      + ',A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z'
      + ',1,2,3,4,5,6,7,8,9,0';

    const chars = randomStr.split(',');
    let randomIndex = 0;

    for (let i = 0; i < length; i = i + 1) {
      // 랜덤 인덱스를 구하고
      randomIndex = Math.floor(Math.random() * chars.length);

      // 인덱스에 해당하는 문자를 추가한다.
      str += chars[randomIndex];
    }

    return str;
  }

  /**
   * 아이디 Validation
   * @param {string} str : 체크할 아이디
   * @return {boolean}
   */
  public static isId(str: string): boolean {
    return !(!str || str.match(/(^[0-9].*(?=[0-9a-zA-Z\.]{2,19}$)(?=.*\d?)(?=.*[a-zA-Z])(?=.*[\.]?).*$)|(^[a-zA-Z].*(?=[0-9a-zA-Z\.]{2,19}$)(?=.*\d?)(?=.*[a-zA-Z]?)(?=.*[\.]?).*$)/) == null);
  }

  /**
   * 이메일 Validation
   * @param {string} str : 체크할 이메일
   * @return {boolean}
   */
  public static isEmail(str: string): boolean {
    return !(!str || str.match(/^(\'.*\'|[A-Za-z0-9_-]([A-Za-z0-9_-]|[\+\.])*)@(\[\d{1,3}(\.\d{1,3}){3}]|[A-Za-z0-9][A-Za-z0-9_-]*(\.[A-Za-z0-9][A-Za-z0-9_-]*)+)$/) == null);
  }

  /**
   * 정수 Validation
   * @param num - 체크할 숫자
   * @return {boolean}
   */
  public static isNumber(num) {
    return isNaN(num) === false && Number(num) >= 0;
  }

  /**
   * 연락처 Validation
   * @param {string} str : 체크할 연락처
   * @return {boolean}
   */
  public static isTel(str: string): boolean {
    return !(!str || str.match(/^(\d+-?)+\d+$/) == null);
  }

  /**
   * URL Validation domain
   * @param {string} str : 체크할 URL
   * @return {boolean}
   */
  public static isDomain(str: string): boolean {
    return /^(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(str);
  }

  /**
   * URL Validation
   * @param {string} str : 체크할 URL
   * @return {boolean}
   */
  public static isURL(str: string): boolean {
    return /^(mirror|http|https):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(str);
  }

  /**
   * HTTP URL Validation
   * @param {string} str : 체크할 URL
   * @return {boolean}
   */
  public static isHTTP(str: string): boolean {
    return /^(http):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(str);
  }

  /**
   * HTTPS URL Validation
   * @param {string} str : 체크할 URL
   * @return {boolean}
   */
  public static isHTTPS(str: string): boolean {
    return /^(https):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(str);
  }

  /**
   * Trim 처리
   * @param {string} str : 문자열
   * @return {string}
   */
  public static trim(str: string): string {
    return $.trim(str);
  }

  /**
   * LTrim 처리
   * @param {string} str : 문자열
   * @return {string}
   */
  public static ltrim(str: string): string {
    return str.replace(/^\s+/, '');
  }

  /**
   * RTrim 처리
   * @param {string} str : 문자열
   * @return {string}
   */
  public static rtrim(str: string): string {
    return str.replace(/\s+$/, '');
  }

  /**
   * Escape 처리
   * @param {string} str: 문자열
   * @return {string}
   */
  public static escapeHtml(str: string): string {

    const entityMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      '\'': '&#39;',
      '/': '&#x2F;',
    };

    return String(str).replace(/[&<>''\/]/g, (s) => {
      return entityMap[s];
    });
  }

  /**
   * 실수 처리 (소수점 둘째자리)
   * @param str - 문자열
   * @return {boolean}
   */
  public static isFloat(str): boolean {
    const floatVal = str;
    return !(isNaN(floatVal) || Infinity === floatVal || -Infinity === floatVal || Number(floatVal) < 0);
  }

  /**
   * 파라미터가 비어있는지 여부
   * param :
   */
  public static isEmpty(param: string): boolean {

    // 빈값일때
    return param === undefined || param === null || (typeof param !== 'number' && this.trim(param) === '');
  }

  /**
   * 파라미터가 비어있지 않은지 여부
   * param :
   */
  public static isNotEmpty(param: string): boolean {
    return !StringUtil.isEmpty(param);
  }

  /**
   * 사용자 정의 필터 쌍따옴표를 대괄호로 변경 처리 처리
   * param : 문자열
   */
  public static unescapeCustomColumnExpr(expr: string): string {

    let returnValue = expr;
    let idx = 0;
    while (returnValue.indexOf('"') > -1) {
      if (idx === 0 || idx % 2 === 0) {
        returnValue = returnValue.replace('"', '[');
      } else {
        returnValue = returnValue.replace('"', ']');
      }
      idx = idx + 1;
    }

    return returnValue;
  }

  /**
   * 패스워드 형식 검사
   * @param {string} str
   * @returns {boolean}
   */
  public static isPassword(str: string): boolean {
    return !(!str || str.match(/^.*(?=^.{10,20}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^*()\-_=+\\\|\[\]{};:\'",.<>\/?`~]).*$/g) == null);
  }

  /**
   * Single Quete 체크
   *
   * 사용예>
   * StringUtil.checkSingleQuote("asdfasdfasdf", false)   >>> [true, "asdfasdfasdf"]
   * StringUtil.checkSingleQuote("asdfasdfasdf", true)    >>> [true, "'asdfasdfasdf'"]
   * StringUtil.checkSingleQuote("asdfasdfasdf'", true)   >>> [false, "asdfasdfasdf'"]
   * StringUtil.checkSingleQuote("asdfa'sdfasdf", false)  >>> [false, "asdfa'sdfasdf"]
   * StringUtil.checkSingleQuote("'asdfasdfasdf", true)   >>> [false, "'asdfasdfasdf"]
   * StringUtil.checkSingleQuote("asdfa'sdfasdf'", true)  >>> [false, "asdfa'sdfasdf'"]
   * StringUtil.checkSingleQuote( "'" )                   >>> [false, "'"]
   * StringUtil.checkSingleQuote( "''" )                  >>> [true, "''"]
   * StringUtil.checkSingleQuote( "''", false, false )    >>> [false, "''"]
   *
   * @param {string} str
   * @param {boolean} isWrapQuote
   * @param {boolean} isAllowBlank
   * @return {[boolean , string]}
   */
  // public static checkSingleQuote(str:string, isWrapQuote:boolean=false, isAllowBlank:boolean=true ):[boolean, string] {
  //   let checkStr:string = str + '';
  //   if( str ) {
  //     const regExpWrapQuote:RegExp = /^'(.*)'$/;
  //     const isWrappedQuote:boolean = regExpWrapQuote.test( checkStr );
  //     if( isWrappedQuote ) {
  //       checkStr = checkStr.replace( regExpWrapQuote, '$1' );
  //     }
  //
  //     if( /[^\\]'/.test( checkStr ) || ( !isAllowBlank && /^\s*$/.test( checkStr ) ) ) {
  //       return [false, str];
  //     } else {
  //       return [true, ( isWrapQuote && !isWrappedQuote ) ? '\'' + str + '\'' : str ];
  //     }
  //   } else {
  //     return [ false, '' ];
  //   }
  // } // function - checkSingleQuote

  /**
   * Single Quete 체크
   *
   * 사용예>
   * StringUtil.checkSingleQuote("asdfasdfasdf", { isWrapQuote : false } )   >>> [true, "asdfasdfasdf"]
   * StringUtil.checkSingleQuote("asdfasdfasdf", { isWrapQuote : true } )    >>> [true, "'asdfasdfasdf'"]
   * StringUtil.checkSingleQuote("asdfasdfasdf'", { isWrapQuote : true } )   >>> [false, "asdfasdfasdf'"]
   * StringUtil.checkSingleQuote("asdfa'sdfasdf", { isWrapQuote : false } )  >>> [false, "asdfa'sdfasdf"]
   * StringUtil.checkSingleQuote("'asdfasdfasdf", { isWrapQuote : true })   >>> [false, "'asdfasdfasdf"]
   * StringUtil.checkSingleQuote("asdfa'sdfasdf'", { isWrapQuote : true })  >>> [false, "asdfa'sdfasdf'"]
   * StringUtil.checkSingleQuote( "'" )                   >>> [false, "'"]
   * StringUtil.checkSingleQuote( "''" )                  >>> [true, "''"]
   * StringUtil.checkSingleQuote( "''", { isWrapQuote : false, isAllowBlank : false } )    >>> [false, "''"]
   * StringUtil.checkSingleQuote( "ad'sf'asd'fas'df", { isPairQuote : true } )    >>> [true, "ad'sf'asd'fas'df"]
   *
   * @param {string} str
   * @param opts - { isPairQuote?:boolean, isWrapQuote?:boolean, isAllowBlank?:boolean }
   * @return {[boolean , string]}
   */
  public static checkSingleQuote(str: string, opts?: any): [boolean, string] {

    if (opts) {
      (opts.hasOwnProperty('isPairQuote')) || (opts.isPairQuote = false);
      (opts.hasOwnProperty('isWrapQuote')) || (opts.isWrapQuote = false);
      (opts.hasOwnProperty('isAllowBlank')) || (opts.isAllowBlank = true);
    } else {
      opts = {
        isPairQuote: false,
        isWrapQuote: false,
        isAllowBlank: true
      };
    }

    let checkStr: string = str + '';
    if (str) {
      const regExpWrapQuote: RegExp = /^'(.*)'$/;
      const isWrappedQuote: boolean = regExpWrapQuote.test(checkStr);
      if (isWrappedQuote) {
        checkStr = checkStr.replace(regExpWrapQuote, '$1');
      }
      if (str === '\'') {
        return [false, ''];
      }

      if (opts.isPairQuote) {
        if (/(["'])(?:(?=(\\?))\2.)*?\1/g.test(checkStr)
          || !/[^\\]'/g.test(checkStr)
          || (!opts.isAllowBlank && /^\s*$/g.test(checkStr))) {
          return [true, (opts.isWrapQuote && !isWrappedQuote) ? '\'' + str + '\'' : str];
        } else {
          return [false, str];
        }
      } else {
        if (/[^\\]'/g.test(checkStr) || (!opts.isAllowBlank && /^\s*$/g.test(checkStr))) {
          return [false, str];
        } else {
          return [true, (opts.isWrapQuote && !isWrappedQuote) ? '\'' + str + '\'' : str];
        }
      }

    } else {
      return [false, ''];
    }
  } // function - checkSingleQuote

  /**
   * 정규표현식 형식인지 체크
   *
   * 사용예>
   * StringUtil.checkRegExp("/adfasdf/") >>> true
   *
   * @param {string} str
   * @return {boolean}
   */
  public static checkRegExp(str: string): boolean {
    const checkStr: string = str + '';
    if (str) {
      const regExpWrapSlash: RegExp = /^\/(.*)\/$/;
      return regExpWrapSlash.test(checkStr);
    } else {
      return false;
    }
  } // function - checkRegExp

  /**
   * 수식 체크
   *
   * 체크예>
   * (colName)        >>>>> false
   * (colName9)       >>>>> false
   * ('colName9')     >>>>> false
   * 'colName9'       >>>>> false
   * 'colN'ame9'      >>>>> false
   * colName9         >>>>> false
   * colNa'me9        >>>>> false
   * count()          >>>>> true
   * sum(colName)     >>>>> true
   * sum(colName9)    >>>>> true
   * sum('colName9')  >>>>> true
   * sum('col'Name9') >>>>> false
   * avg(colName)     >>>>> true
   * min(colName)     >>>>> true
   * max(colName)     >>>>> true
   * max('colName')   >>>>> true
   * max('colN'ame')  >>>>> false
   * colname='1'      >>>>> true
   * colname=1        >>>>> true
   * colname ='1'     >>>>> true
   * colname =1       >>>>> true
   * asdfasdfa        >>>>> false
   * 2341efee         >>>>> false
   *
   * @param {string} str
   * @return {boolean}
   */
  public static checkFormula(str: string): boolean {
    /* rexexp 구성
      count 체크 : count\(\)
      sum 체크 : sum(\([a-zA-Z0-9]*\)|\('[a-zA-Z0-9]*'\))
      avg 체크 : avg(\([a-zA-Z0-9]*\)|\('[a-zA-Z0-9]*'\))
      min 체크 : min(\([a-zA-Z0-9]*\)|\('[a-zA-Z0-9]*'\))
      max 체크 : max(\([a-zA-Z0-9]*\)|\('[a-zA-Z0-9]*'\))
      일반수식 체크 : ^[a-zA-Z0-9]*\s?=\s?([a-zA-Z0-9]*|'[a-zA-Z0-9]*')$
     */
    const regExpFormula: RegExp = /count\(\)|sum(\([a-zA-Z0-9_]*\)|\('[a-zA-Z0-9_]*'\))|avg(\([a-zA-Z0-9_]*\)|\('[a-zA-Z0-9_]*'\))|min(\([a-zA-Z0-9_]*\)|\('[a-zA-Z0-9_]*'\))|max(\([a-zA-Z0-9_]*\)|\('[a-zA-Z0-9_]*'\))|^[a-zA-Z0-9_]*\s?=\s?([a-zA-Z0-9_]*|'[a-zA-Z0-9_]*')$/;
    return regExpFormula.test(str);
  } // function - checkFormula

  public static isAlphaNumericUnderscore(str: string): boolean {
    return str.match(/^[a-zA-Z0-9_]+$/) != null;
  }

  /**
   * Replace query string
   * @param {string} str
   * @return {string}
   */
  public static replaceURIEncodingInQueryString(str: string): string {
    return str.replace(/#|\?|%|;/g, encodeURIComponent);
  }
}


