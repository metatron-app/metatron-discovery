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

import { AfterViewInit, ElementRef, EventEmitter, Injector, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractComponent } from '../../../../../../common/component/abstract.component';
import { Field, Rule } from '../../../../../../domain/data-preparation/dataset';
import { isNullOrUndefined } from 'util';

export abstract class EditRuleComponent extends AbstractComponent implements OnInit, AfterViewInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public isShow: boolean = false;
  public mode : string = 'APPEND';
  public ruleVO : Rule;
  public colDescs : any;

  public fields : Field[];
  public selectedFields: Field[] = [];

  @Output()
  public onEvent:EventEmitter<any> = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  protected constructor(
    protected elementRef: ElementRef,
    protected injector: Injector) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 컴포넌트 초기 실행
   */
  public ngOnInit() {
    super.ngOnInit();
  } // function - ngOnInit

  /**
   * 화면 초기화
   */
  public ngAfterViewInit() {
    super.ngAfterViewInit();
  } // function - ngAfterViewInit

  /**
   * 컴포넌트 제거
   */
  public ngOnDestroy() {
    super.ngOnDestroy();
  } // function - ngOnDestroy

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - API
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public init(fields : Field[], selectedFields:Field[], ruleString?:string) {
    this.fields = fields;
    this.selectedFields = selectedFields;
    if( !isNullOrUndefined( ruleString ) ) {
      ruleString = ruleString.replace( /,\s*/g, ',' );  // 각 속성별 값을 얻기 위해서 미리 Comma 사이의 공백을 제거함
      this.parsingRuleString(ruleString);
    }

    this.beforeShowComp();

    this.isShow = true;

    this.afterShowComp();
  } // function - init

  public setColDescs ( cols ) {
    this.colDescs = cols;
  }

  /**
   * Rule 형식 정의 및 반환
   */
  public abstract getRuleData();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 컴포넌트 표시 전 실행
   * @protected
   */
  protected abstract beforeShowComp();

  /**
   * 컴포넌트 표시 후 실행
   * @protected
   */
  protected abstract afterShowComp();

  /**
   * rule string 을 분석한다.
   * @param ruleString
   * @protected
   */
  protected abstract parsingRuleString(ruleString:string);

  /**
   * rule String 내 특정 속성에 대한 값을 얻는다.
   * @param attr
   * @param ruleString
   * @protected
   */
  protected getAttrValueInRuleString( attr:string, ruleString:string ) {
    const parsingResult:string[] = (new RegExp( attr + '\\s?:\\s?(\\S*)' )).exec( ruleString );
    return ( parsingResult ) ? parsingResult[1] : '';
  } // function - getAttrValueInRuleString

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


}
