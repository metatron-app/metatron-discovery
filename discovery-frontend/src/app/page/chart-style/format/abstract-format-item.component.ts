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

import {ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {AbstractComponent} from '@common/component/abstract.component';
import {SelectComponent} from '@common/component/select/select.component';
import {Format} from '@domain/workbook/configurations/format';
import {
  ChartType,
  GridViewType,
  UIFormatNumericAliasType,
  UIFormatSymbolPosition
} from '@common/component/chart/option/define/common';
import {FormatOptionConverter} from '@common/component/chart/option/converter/format-option-converter';
import {CustomSymbol} from '@common/component/chart/option/ui-option/ui-format';
import {OptionGenerator} from '@common/component/chart/option/util/option-generator';
import {UIOption} from '@common/component/chart/option/ui-option';
import {UIGridChart} from '@common/component/chart/option/ui-option/ui-grid-chart';
import UI = OptionGenerator.UI;

export abstract class AbstractFormatItemComponent extends AbstractComponent implements OnInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild('typeListSelect', {static: true})
  private typeListComp: SelectComponent;

  @ViewChild('signListSelect', {static: true})
  private signListComp: SelectComponent;

  @ViewChild('numericAliasListSelect')
  private numericAliasListComp: SelectComponent;

  // 타입 목록
  private _orgTypeList: object[] = [
    {name: this.translateService.instant('msg.page.li.num'), value: 'number'},
    {name: this.translateService.instant('msg.page.li.currency'), value: 'currency'},
    {name: this.translateService.instant('msg.page.li.percent'), value: 'percent'},
    {name: this.translateService.instant('msg.page.li.exponent'), value: 'exponent10'}
  ];

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 포맷 정보가 바뀐 경우
  @Output('changeFormat')
  public changeEvent: EventEmitter<any> = new EventEmitter();

  public uiOption: UIOption;

  // 포맷정보
  public format: Format;

  // 타입 목록
  public typeList: any[] = [
    {name: this.translateService.instant('msg.page.li.num'), value: 'number'},
    {name: this.translateService.instant('msg.page.li.currency'), value: 'currency'},
    {name: this.translateService.instant('msg.page.li.percent'), value: 'percent'},
    {name: this.translateService.instant('msg.page.li.exponent'), value: 'exponent10'}
  ];

  // 선택된 공통 타입
  public selectedType: any = this.typeList[0];

  // 기호: 통화일때
  public currencySignList: object[] = [
    {name: '₩ (KRW)', value: 'KRW'},
    {name: '$ (USD)', value: 'USD'},
    {name: '£ (GBP)', value: 'GBP'},
    {name: '¥ (JPY)', value: 'JPY'},
    {name: '€ (EUR)', value: 'EUR'},
    {name: '¥ (CNY)', value: 'CNY'}
  ];

  // 선택된 기호
  public selectedSign: object = this.currencySignList[0];

  // 소수 자리수
  public decimal: number = 2;
  public decimalCopy: number = this.decimal;
  public MIN_DIGIT: number = 0;
  public MAX_DIGIT: number = 5;

  // 1000자리 구분자 사용여부
  public useThousandsSep: boolean = false;

  // 수치표기 약어목록
  public numericAliasList: object[] = [
    {
      name: this.translateService.instant('msg.page.format.numeric.alias.none'),
      value: String(UIFormatNumericAliasType.NONE)
    },
    {
      name: this.translateService.instant('msg.page.format.numeric.alias.auto'),
      value: String(UIFormatNumericAliasType.AUTO)
    },
    {
      name: this.translateService.instant('msg.page.format.numeric.alias.kilo'),
      value: String(UIFormatNumericAliasType.KILO)
    },
    {
      name: this.translateService.instant('msg.page.format.numeric.alias.milion'),
      value: String(UIFormatNumericAliasType.MEGA)
    },
    {
      name: this.translateService.instant('msg.page.format.numeric.alias.billion'),
      value: String(UIFormatNumericAliasType.GIGA)
    },{
      name: this.translateService.instant('msg.page.format.numeric.alias.kilo.ko'),
      value: String(UIFormatNumericAliasType.KILO_KOR)
    },
    {
      name: this.translateService.instant('msg.page.format.numeric.alias.million.ko'),
      value: String(UIFormatNumericAliasType.MEGA_KOR)
    },
    {
      name: this.translateService.instant('msg.page.format.numeric.alias.billion.ko'),
      value: String(UIFormatNumericAliasType.GIGA_KOR)
    },
  ];

  // 선택된 수치표기 약어
  public selectedNumericAlias: object = this.numericAliasList[0];

  // 포멧 위치 리스트
  public positionList: object[] = [
    {
      name: this.translateService.instant('msg.page.format.custom.symbol.position.front'),
      value: UIFormatSymbolPosition.BEFORE
    },
    {
      name: this.translateService.instant('msg.page.format.custom.symbol.position.back'),
      value: UIFormatSymbolPosition.AFTER
    }
  ];

  // 미리보기 값
  public preview: string;

  // 단위설정
  public customSymbol: CustomSymbol;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Getter & Setter
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @Input('uiOption')
  public set setUiOption(uiOption: UIOption) {
    this.uiOption = uiOption;
    this.typeList = JSON.parse(JSON.stringify(this._orgTypeList));
    if (uiOption.type === ChartType.GRID && (uiOption as UIGridChart).dataType === GridViewType.MASTER) {
      this.typeList.push({name: this.translateService.instant('msg.page.li.origin'), value: 'origin'});
    }
  }

  @Input('format')
  public set setFormat(format: Format) {

    if (!format) {
      return;
    }

    // Set
    this.format = format;
    this.setType = this.format.type;
    this.setSign = this.format.sign;
    this.decimal = this.format.decimal;
    this.decimalCopy = this.decimal;
    this.useThousandsSep = this.format.useThousandsSep;
    this.setNumericAlias = this.format.abbr;
    if (this.format.customSymbol) {
      this.customSymbol = {};
      this.customSymbol.value = this.format.customSymbol ? this.format.customSymbol.value : '';
      this.customSymbol.pos = this.format.customSymbol ? this.format.customSymbol.pos : UIFormatSymbolPosition.BEFORE;
      this.customSymbol.abbreviations = this.format.customSymbol ? this.format.customSymbol.abbreviations : false;
    }

    // 설정된 포멧으로 preview값 설정
    this.preview = FormatOptionConverter.getFormatValue(1000, this.format);
  }

  // 외부에서 타입 주입
  @Input('type')
  public set setType(type: string) {

    // 값이 유효하지 않으면 패스~
    if (!type) {
      return;
    }

    // 타입 목록에서 찾아서 주입
    for (let num: number = 0; num < this.typeList.length; num++) {
      if (this.typeList[num]['value'] === type) {
        this.typeListComp.setDefaultIndex = num;
        this.selectedType = this.typeList[num];
        this.changeDetect.detectChanges();
        break;
      }
    }
  }

  // 외부에서 심볼타입 주입
  @Input('sign')
  public set setSign(sign: string) {

    // 값이 유효하지 않으면 패스~
    if (!sign || !this.signListComp) {
      return;
    }

    const signList: object[] = this.currencySignList;

    // 심볼 목록에서 찾아서 주입
    for (let num: number = 0; num < signList.length; num++) {
      if (signList[num]['value'] === sign) {
        this.signListComp.setDefaultIndex = num;
        this.selectedSign = signList[num];
        break;
      }
    }
  }

  // 외부에서 수치표시 약어설정 주입
  @Input('numericAlias')
  public set setNumericAlias(numericAlias: string) {

    // 값이 유효하지 않으면 패스~
    if (!numericAlias || !this.numericAliasListComp) {
      return;
    }

    const aliasList: object[] = this.numericAliasList;

    // 심볼 목록에서 찾아서 주입
    for (let num: number = 0; num < aliasList.length; num++) {
      if (aliasList[num]['value'] === numericAlias) {
        this.numericAliasListComp.setDefaultIndex = num;
        this.selectedNumericAlias = aliasList[num];
        break;
      }
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  protected constructor(protected elementRef: ElementRef,
                        protected injector: Injector) {
    super(elementRef, injector);
    this.typeList = JSON.parse(JSON.stringify(this._orgTypeList));
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 타입 변경 핸들러
   * @param type
   */
  public onTypeChange(type: object): void {

    // 타입변경
    this.selectedType = type;

    // 변경 이벤트 발생
    this.change();
  }

  /**
   * 심볼 변경 핸들러
   * @param sign
   */
  public onSignChange(sign: object): void {

    // 심볼변경
    this.selectedSign = sign;

    // 변경 이벤트 발생
    this.change();
  }

  /**
   * 자리수 변경 핸들러
   * @param isPlus
   */
  public onDigitChange(isPlus: boolean): void {
    if (isPlus) {

      if (this.decimal === this.MAX_DIGIT) {
        return;
      }

      this.decimal = this.decimal + 1;
    } else {

      if (this.decimal === this.MIN_DIGIT) {
        return;
      }

      this.decimal = this.decimal - 1;
    }

    this.decimalCopy = this.decimal;

    // 변경 이벤트 발생
    this.change();
  }

  /**
   * 자리수 입력 변경후 핸들러
   */
  public onDigitValid(): void {

    if (this.decimalCopy === this.decimal) {
      return;
    }

    if (this.decimalCopy < this.MIN_DIGIT || this.decimalCopy > this.MAX_DIGIT) {
      this.decimalCopy = 2;
    }

    this.decimal = this.decimalCopy;

    // 변경 이벤트 발생
    this.change();
  }

  /**
   * 1000단위 구분자 사용여부 변경 핸들러
   */
  public onThousandsSepChange(): void {

    // Set
    this.useThousandsSep = !this.useThousandsSep;

    // 변경 이벤트 발생
    this.change();
  }

  /**
   * 수치표시 약어설정 변경 핸들러
   * @param numericAlias
   */
  public onNumericAliasChange(numericAlias: object): void {
    console.log('onNumericAliasChange');
    console.log(numericAlias);
    // 심볼변경
    this.selectedNumericAlias = numericAlias;

    // 변경 이벤트 발생
    this.change();
  }

  /**
   * 변경 이벤트 발생
   */
  public change(): void {

    // Null Check
    if (!this.format) {
      this.format = {};
    }

    this.format = {};

    // Value Setting
    this.format.type = this.selectedType['value'];
    this.format.sign = this.selectedSign['value'];
    this.format.decimal = this.decimal;
    this.format.useThousandsSep = this.useThousandsSep;
    this.format.abbr = this.selectedNumericAlias['value'];
    this.format.customSymbol = this.customSymbol;

    // 설정된 포멧으로 preview값 설정
    this.preview = FormatOptionConverter.getFormatValue(1000, this.format);

    // Dispatch Event
    this.changeEvent.emit(this.format);
    console.log('change');
    console.log(this.format);
  }

  /**
   * 사용자 기호위치 변경시
   */
  public changePosition(position: any): void {

    // 선택된값 설정
    this.customSymbol.pos = position.value;

    // 변경 이벤트 발생
    this.change();
  }

  /**
   * custom symbol 변경시
   */
  public changeSymbol(): void {

    // 변경 이벤트 발생
    this.change();
  }

  /**
   * symbol show 설정
   */
  public showCustomSymbol(): void {

    // customSymbol값이 있는경우
    if (this.customSymbol) {

      this.customSymbol = null;
      // customSymbol값이 없는경우
    } else {

      // customSymbol 생성
      this.customSymbol = UI.Format.customSymbol(UIFormatSymbolPosition.BEFORE);
    }

    // 변경 이벤트 발생
    this.change();
  }

  /**
   * 숫자기호 표시 변경
   */
  public changeNumberSymbol(): void {

    // 선택된값 설정
    this.customSymbol.abbreviations = !this.customSymbol.abbreviations;

    // 변경 이벤트 발생
    this.change();
  }

  public checkSelectedType(type: string): boolean {
    return (this.selectedType['value'] == type);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


}
