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

import { isUndefined } from 'util';
import {
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output, SimpleChange, SimpleChanges,
  ViewChild
} from '@angular/core';

import { AbstractComponent } from '../../../../../../common/component/abstract.component';
import { Field } from '../../../../../../domain/data-preparation/pr-dataset';
import { EventBroadcaster } from "../../../../../../common/event/event.broadcaster";
import { RuleSuggest } from '../rule/suggest/rule.suggest';
import { TokenInfo } from '../rule/suggest/rule.checker';

@Component({
  selector: 'rule-suggest-input',
  templateUrl: './rule-suggest-input.component.html'
})
export class RuleSuggestInputComponent extends AbstractComponent implements OnInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild('inputElem')
  private _inputElem: ElementRef;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /** 룰 정보 */
  @Input()
  public command: string;

  /** 룰 조건 on: col: */
  @Input()
  public cmdArg: string;

  @Input()
  public tabIndex: number;

  /** 데이타 컬럼 정보 */
  @Input()
  public fields: Field[];

  /** 데이타 변경 시 호출  */
  @Output()
  public onChange: EventEmitter<string> = new EventEmitter();

  @Input()
  public placeholder : string = this.getMsg('msg.dp.th.condition.ph');

  /** 초기에 입력한 값 */
  @Input('formula')
  public inputFormula: string;

  public formula: string;

  /** 내용 입력 없을 경우 화면에 모든 제안 보여줄지 여부 */
  @Input()
  public isEmptyViewAll = false;

  /** 화면에 보여줄 함수 타입 */
  @Input()
  public funcType = 'all'; /* all, aggr, window, common, no */

  /** 화면에 보여줄 컬럼 타입 */
  @Input()
  public columnType = 'all'; /* all, no */

  /** 컬럼 선택시 backtick을 붙일지 여부 */
  @Input()
  public isBackTick = true; 

  /** 화살표 버튼이 눌러졌는지 여부 (한글 완전히 입력하지 않았을 경우 down arrow 검사용) */
  public isArrowDown = false;

  /** 아이템 높이 (화살표시 이동할 스크롤 바 ) */
  public itemHeight = 25;

  /* 제안 화면에 표시할 아이템 */
  public suggestItems: any = [];
  
  /** 제안 목록에서 위 아래 화살표로 선택한 포지션 */
  public selectedIndex: number = -1;

  /** 제안 열기 여부 */
  public isSuggestOpen: boolean = false;

  /** 룰 제안자 */
  private ruleSuggest:RuleSuggest;

  /** 현재 포지션에서 선택된 토큰 */
  private selectedTokenInfo: TokenInfo;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


  // 생성자
  constructor(
    private broadCaster: EventBroadcaster,
    protected elementRef: ElementRef,
    protected injector: Injector) {
    
      super(elementRef, injector);
      // 룰 제안 초기화
      this.ruleSuggest = new RuleSuggest();

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 컴포넌트 초기 실행
   */
  public ngOnInit() {
    super.ngOnInit();

    this.setBroadcast();
  } // function - ngOnInit

  /**
   * 화면 초기화
   */
  public ngAfterViewInit() {
    super.ngAfterViewInit();
  } // function - ngAfterViewInit

  /**
   * Input 값 변경 체크
   * @param {SimpleChanges} changes
   */
  public ngOnChanges(changes: SimpleChanges) {
    const inputFormulaChanges: SimpleChange = changes.inputFormula;
    if( inputFormulaChanges && inputFormulaChanges.firstChange ) {
      this.formula = inputFormulaChanges.currentValue;
    }

    const fieldsChanges: SimpleChange = changes.fields;
    if( fieldsChanges && fieldsChanges.currentValue !== fieldsChanges.previousValue) {
      // column 정보 변경 되었을때 설정
      this.ruleSuggest.setColumnList(this.fields);
    }
  } // function - ngOnChanges

  /**
   * 컴포넌트 제거
   */
  public ngOnDestroy() {
    super.ngOnDestroy();
  } // function - ngOnDestroy

  /**
   * subscribe 설정
   */
  public setBroadcast() {
    
    this.broadCaster.on<any>('EDIT_RULE_SHOW_HIDE_LAYER').subscribe((data: { id : string, isShow : boolean }) => {
      this.closeSuggest();
    })
  
  } 

  /**
   * Set focus on input
   */
  public setFocus() {
    this._inputElem.nativeElement.focus();
  }

  /**
   * Returns formula value
   * @returns {string}
   */
  public getFormula(): string {
    return this.formula;
  }

  /**
   * When you want to set value to input
   * @param {string} formula
   */
  public setFormula(formula: string) {
    this.formula = formula;
  }

  protected getMsg( key: string, defaultValue?: string): string {

    let value = '' ;// this.translateService.instant(key);
    if( !value && defaultValue ) {
      value = defaultValue;
    }

    return value;
   
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - API
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 제안 스타일 
   * @param idx 
   * @param item 
   */
  public getSuggestStyle(idx, item) {

    const color = item.type === 'func' ? 'Olive' : 'DodgerBlue';

    if( this.selectedIndex == idx ) {
      // 아이템이 선택 되었을때 
      return {
        'background-color':'#f6f6f7',
        'color': color
      }
    } else {
      return {
        'color': color
      }
    }
  }
  
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 이벤트 무효화 시키지 위한 동작
   * @param $event 
   */
  public onKeyDown( $event) {
    try{
      const keyCode = $event.keyCode;

      if( keyCode === 38 || keyCode == 40) {
        this.isArrowDown = true; /* 한글 입력이 완료되지 않고 아래 화살표를 누르면 화살표 업 이벤트가 실행 된다. */

        // suggetion 이 있을 경우 하살표 위 아래의 동작이 맨앞으로 가거나 맨 뒤로 가지 않도록한다.
        if( this.isSuggestOpen && this.suggestItems && this.suggestItems.length > 0 ) {
          if( keyCode === 38 ) {
            if( this.selectedIndex > -1 ) {
              // 화살표가 suggetion 위에 있을 경우 아무 일도 하지 않는다.
              $event.preventDefault();  
            } else {
              // 화살표가 input box에 있을 경우 원래 동작 한다.
              this.initSuggest();
            }
          }  else if( keyCode == 40 ) {
            $event.preventDefault();
          }
        }
        
      }
    }catch (e) {
      console.info('onKeyDown Exception', e);
    }
  }

  /**
   * text box key 이벤트 
   * @param $event 
   */
  public onKeyUp( $event) {

    try{
      return this.prcessEvent($event);
    } catch (e) {
      console.info('onKeyUp Exception', e);
    }
  } 

  public onClick( $event ) {

    const input = $event.currentTarget;
    if( this.isEmptyViewAll && input.value.trim().length < 1) {
      // 아무 것도 입력 되지 않았을 경우 
      this.setSuggetionInfoByType();
    } else {
      this.closeSuggest();
    }
    
  }

  /**
   * 제안 정보 설정
   * @param ruleString 
   * @param poz 
   */
  protected setSuggetionInfo( ruleString: string, poz: number) {

    const parseInfo = this.ruleSuggest.getParseInfo(ruleString);

    const tokenPoz = poz - 1; /* antlr 파서 토큰 위치  poz - 1 */
    
    const tokenInfo = this.ruleSuggest.getPozToken( parseInfo, tokenPoz );

    let funcType = this.funcType ;
    let columnType = this.columnType;

    try{
      // 부모가 함수 이름인지 
      const parFuncName = this.ruleSuggest.getParentFuction(parseInfo.tokens, tokenPoz);

      // 함수가 컬럼 이름만 파라마터로 취하는지 여부
      if( this.ruleSuggest.isOnlyColumnName(parFuncName) ) {
        funcType = 'no';
      }

      if( this.isFisrtFuncCommand(parseInfo.tokens.length) ){
        columnType = 'no';
      }
    }catch(e) {
      console.info('warn RuleSuggestInputComponent.setSuggetionInfo ',e);
    }

    const itemList = this.ruleSuggest.getList(tokenInfo, tokenPoz, funcType, columnType );
    
    this.selectedTokenInfo = tokenInfo;

    if( itemList && itemList.length > 0 ){
      this.isSuggestOpen = true;
      this.suggestItems = itemList;
      this.selectedIndex = -1;
    } else {
      this.initSuggest();
    }
    
  }

  /**
   * 첫번째는 함수 목록만 보여 주는 경우
   * @param tokenLength 토큰의 개수가 <=4 
   */
  protected isFisrtFuncCommand(tokenLength: number = 3) {
    if( !this.command ) {
      return false;
    }

    const cmd = this.command.toLowerCase();

    if( 'window' === cmd || 'pivot' === cmd || 'aggregate' === cmd ) {
      // aggr, window 이면 , column 나오지 않게

      if( tokenLength < 5) {
        // token 개수가 4개보다 크면 함수이름이 아니고 파라미터 들이다.
        return true;
      }
    }

    return false;
  }

  /**
   * 제안 정보 설정
   * @param ruleString 
   * @param poz 
   */
  protected setSuggetionInfoByType( funcType?: string, columnType?:string) {

    if( !funcType ) {
      funcType = this.funcType ;
    }

    if( !columnType ) {
      columnType = this.columnType ;
    }

    const funcList = this.ruleSuggest.getFuncList('',funcType);

    if( this.isFisrtFuncCommand() ) {
      columnType = 'no';
    }
    const columnList = this.ruleSuggest.getColumnList('',columnType);
    
    const itemList = funcList.concat(columnList);  

    this.selectedTokenInfo = {
        text: '',
        start: 0,
        stop: 0,
        type: -1,
        tokenIndex: -1,
        isStart: false,
        isError: false
    };

    if( itemList && itemList.length > 0 ){
      this.isSuggestOpen = true;
      this.suggestItems = itemList;
      this.selectedIndex = -1;
    } else {
      this.initSuggest();
    }
    
  }

  /**
   * 자동완성 아이템을 선택 했을 경우
   * @param item
   */
  public onSelectAutoComplete(item) {

    let input = this._inputElem.nativeElement;

    if (isUndefined(input) || !item ) {
      return;
    }

    let inputVal = input.value;

    if(inputVal.trim().length < 1) {
      //문쟈열 입력이 없으면 

      input.blur();

      const insertValue = this.getInsertValue(item);

      // input text box 값을 선택 값으로 치환한다.
      input.value = insertValue;
      // text box 커서를 입력값 뒤로 둔다
      const valueLength = insertValue.length;
      input.selectionStart = valueLength;
      input.selectionEnd = valueLength;

      this.formula = input.value;
      
      this.onChange.emit(this.formula);

      input.focus();
    } else {
      const baseString = this.getBaseRule();
      const baseLength = baseString.length;

      let start = this.selectedTokenInfo.start - baseLength;
      let end = this.selectedTokenInfo.stop - baseLength;
      
      const preStr = inputVal.substring(0, start);
      const postStr = inputVal.substring(end+1);
      

      input.blur();

      const insertValue = this.getInsertValue(item);

      const valueLength = insertValue.length;

      // input text box 값을 선택 값으로 치환한다.
      input.value = preStr + insertValue + postStr;
      // text box 커서를 입력값 뒤로 둔다
      input.selectionStart = start + valueLength;
      input.selectionEnd = start + valueLength;

      this.formula = input.value;
      
      this.onChange.emit(this.formula);

      input.focus();
    }

    this.initSuggest();

  }

  /**
   * suggestion 닫기
   */
  public closeSuggest() {
    this.initSuggest();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 제안 이벤트 실행
   * @param $event 
   */
  protected prcessEvent($event) {
    const keyCode = $event.keyCode;

    if( $event.metaKey === true || $event.ctrlKey === true || $event.altKey === true ){
      return true;
    } else if ( 16 === keyCode && this.isSuggestOpen ) {
      // 대소문자 입력후 아무일도 하지 않는다.
      return true;
    }

    if( keyCode === 38 || keyCode == 40) {

      if( this.isArrowDown) {
        // 이전에 화살표 Down Event가 아니면
        // 화살표 위 아래 처리
        this.isArrowDown = false;
        return this.processUpDown(keyCode, $event);
      } else {
        this.isArrowDown = false;
        return true;
      }
    } else if (keyCode === 13 || keyCode === 108) {   
      // Enter
      return this.processEnter($event);
    } else if(keyCode === 27) {   
      // ESC
      return this.processEsc();
    } else if(keyCode === 37) {   
      // Arrow Left
      this.initSuggest();
      return true;
    } else if(keyCode === 39) {   
      // Arrow Left
      this.initSuggest();
      return true;
    } else if (keyCode === 8) {
      // backspace
      const input = $event.currentTarget;
      if( this.isEmptyViewAll && input.value.trim().length < 1) {
        // 아무 것도 입력 되지 않았을 경우 
        this.setSuggetionInfoByType();
      } else {
        this.initSuggest();
      }

      return true;
    }
    
    let isNumber = false;
    let isLowerChar = false;
    let isUpperChar = false;
    if ( 48 <= keyCode && keyCode <= 57) {
      // Number
      isNumber = true;
    } else if ( 65 <= keyCode && keyCode <= 90) {
        // Alphabet upper case
        isUpperChar = true;
    } else if ( 97 <= keyCode && keyCode <= 122) {
        // Alphabet lower case
        isLowerChar = true;
    }

    if( !isNumber && !isLowerChar && !isUpperChar ) {
      // 문자와 숫자가 아니면 초기화
      this.processEsc()
      return true;
    }
  
    const input = $event.currentTarget;

    const baseString = this.getBaseRule();
    const ruleString = baseString + input.value; 
    const inputPoz = this.getCursorPosition( input);

    const poz = inputPoz+baseString.length;
    
    this.setSuggetionInfo(ruleString, poz);
    

    if( $event.preventDefault ) {
      // 기본 이벤트 취소
      $event.preventDefault();
    }
    return false;
  }

  /**
   * 파싱을 하기 위한 command + cmdArg
   */
  protected getBaseRule(): string{
    return this.command + ' ' + this.cmdArg + ':';
  }

  /**
   * suggestion 초기화
   */
  protected initSuggest() {

    if( this.suggestItems.length > 0) {
      this.suggestItems = [];
    }

    this.isSuggestOpen = false;
    this.selectedIndex = -1;
  }

  /**
   * 화살표 위아래 처리
   * @param keyCode
   */
  protected processUpDown(keyCode, $event?) {
    if( keyCode === 38 || keyCode == 40) {
      if( !this.suggestItems || this.suggestItems.length < 1 ) {
        return true;
      }

      const length = this.suggestItems.length;

      if ( keyCode === 38) {  // Arrow Up
        this.selectedIndex--;
      } else if ( keyCode === 40) { // Arrow Down
        this.selectedIndex++;
      }

      if( this.selectedIndex < 0 ){
        this.selectedIndex = length-1;
      } else if( this.selectedIndex > (length-1) ){
        this.selectedIndex = 0;
      }

      // 화살표 움직임시 스크롤바 조정 
      let sHeight = this.selectedIndex * this.itemHeight;
      this.$element.find('.ddp-list-command').scrollTop(sHeight);

      if( $event &&  $event.preventDefault ) {
        $event.stopPropagation();
        $event.preventDefault();
      }

      return false;
    }
  }

  /**
   * Enter 키 처리
   */
  protected processEnter($event?) {

    if (0 <= this.selectedIndex && this.selectedIndex < this.suggestItems.length) {
      // 자동완성 선택이 있으면 
      this.onSelectAutoComplete(this.suggestItems[this.selectedIndex]);

      if( $event &&  $event.preventDefault ) {
        $event.preventDefault();
      }

      return false;
    }
    return true;
  }

  /**
   * Esc 처리
   */
  protected processEsc() {

    this.initSuggest();

    return false;
  }

  /** 실제 text box에 표시할 값 */
  protected getInsertValue(item) {
    let value = item.value;

    if( item.type === 'column') {
      // add backticks to column name ; 
      if( this.isBackTick ) {
        value = '`' + value + '`';
      }
    }

    return value;
  }

  /** 현재 커서는 시작 선택 위치 */
  protected getCursorPosition(input) {
    return this.getSelectionStart(input);
  }

  /** 선택 시작 위치 */
  protected getSelectionStart(input) {
    return input.selectionStart;
  }
  
  /** 선택 끝 위치 */
  protected getSelectionEnd(input) {
    return input.selectionEnd;
  }

  /** 선택한 문자열 */
  protected getSelectedText(input): string {
    const value = input.value;
    const start = this.getSelectionStart(input);
    const end = this.getSelectionEnd(input);
    return value.substring(start, end);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
