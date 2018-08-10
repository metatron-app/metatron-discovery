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

// import {
//   Component, ElementRef, Injector, OnDestroy, OnInit, Input, ViewChild, ViewChildren,
//   QueryList, Output, EventEmitter
// } from '@angular/core';
// import { BaseChartStyleComponent } from './base-chart-style.component';
// import { Field as AbstractField } from '../../domain/workbook/configurations/field/field';
// import {Pivot} from "../../domain/workbook/configurations/pivot";
// import * as _ from 'lodash';
// import {UIOption} from "../../common/component/chart/option/ui-option-v1";
// import {ChartType, LabelConvertType, ShelveFieldType} from "../../common/component/chart/option/define/v1/common";
// import {Alert} from "../../common/util/alert.util";
// import {SelectComponent} from "../../common/component/select/select.component";
//
// @Component({
//   selector: 'split-style',
//   templateUrl: './split-chart-style.component.html'
// })
// export class SplitChartStyleComponent extends BaseChartStyleComponent implements OnInit, OnDestroy {
//   /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//    | Private Variables
//    |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
//
//   @ViewChild('splitByListSelect')
//   private splitByListSelect: SelectComponent;
//
//   /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//    | Protected Variables
//    |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
//
//   /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//   | Public Variables
//   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
//
//   // 개별포맷 정보가 바뀐 경우
//   @Output('changeEach')
//   public changeEachEvent: EventEmitter<any> = new EventEmitter();
//
//   // Pivot 데이터
//   public pivot: Pivot;
//   @Input('pivot')
//   set setPivot(pivot: Pivot) {
//
//     // Set
//     this.pivot = pivot;
//
//     // Split 옵션 초기화
//     this.initSplit();
//   }
//
//   // UI Option
//   @Input('uiOption')
//   set setUiOption(uiOption: UIOption) {
//
//     // Set
//     this.uiOption = uiOption;
//
//     // Split 옵션 초기화
//     this.initSplit();
//   }
//
//   // Split by 목록
//   public splitBy: Object[] = [];
//
//   // 컬럼개수
//   public columnCount: number = 2;
//
//   // 로우개수
//   public rowCount: number = 2;
//
//   /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//    | Constructor
//    |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
//
//   // 생성자
//   constructor(protected elementRef: ElementRef,
//               protected injector: Injector) {
//
//     super(elementRef, injector);
//   }
//
//   /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//    | Override Method
//    |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
//
//   // Init
//   public ngOnInit() {
//
//     // Init
//     super.ngOnInit();
//   }
//
//   // Destory
//   public ngOnDestroy() {
//
//     // Destory
//     super.ngOnDestroy();
//   }
//
//   /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//    | Public Method
//    |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
//
//   /**
//    * Split 가능 조건 반환
//    * @returns {boolean}
//    */
//   public getSplitCondition(): string[] {
//
//     // 반환
//     let result: string[] = [];
//
//     // 교차 선반에 측정값 개수
//     let measureCount: number = 0;
//     _.each(this.pivot.aggregations, (item) => {
//       if( _.eq(item.type, ShelveFieldType.MEASURE) ) {
//         measureCount++;
//       }
//     });
//
//     // 교차 선반의 차원값 개수
//     let seriesCount: number = 0;
//     _.each(this.pivot.aggregations, (item) => {
//       if( !_.eq(item.type, ShelveFieldType.MEASURE) ) {
//         seriesCount++;
//       }
//     });
//
//     // 교차 선반에 측정값 2개 이상일 경우
//     if( measureCount >= 2 ) {
//       result.push("MEASURES");
//     }
//
//     // 교차 선반에 측정값 1개 이상이면서, 차원값이 시리즈로 구성된 경우
//     if( measureCount >= 1 && seriesCount >= 1 ) {
//       result.push("SERIES");
//     }
//
//     // 그 외엔 비활성화
//     return result;
//   }
//
//   /**
//    * 선반 조건이 Split 가능한지 여부
//    * @returns {boolean}
//    */
//   public isNotSplit(): boolean {
//
//     return this.getSplitCondition().length <= 0;
//   }
//
//   /**
//    * Split On / Off 핸들러
//    */
//   public onSplitChange(): void {
//
//     // On일 경우
//     if( this.uiOption.split ) {
//       delete this.uiOption.split;
//     }
//     // Off일 경우
//     else {
//
//       this.columnCount = 2;
//       this.rowCount = 2;
//
//       // Split 가능 조건
//       const splitCondition: string[] = this.getSplitCondition();
//
//       // Split by 목록 초기화
//       this.splitBy = _.indexOf(splitCondition, "MEASURES") != -1 ? [{name: 'Measures', value: 'MEASURES'}] : [];
//       if( _.indexOf(splitCondition, "SERIES") != -1 ) {
//         _.each(this.pivot.aggregations, (item) => {
//           if( !_.eq(item.type, ShelveFieldType.MEASURE) ) {
//             const name: string = item.alias ? item.alias : item.fieldAlias ? item.fieldAlias : item.name;
//             this.splitBy.push({name: name, value: name});
//             // TODO: 임시로 교차 Dimension 한개만 가능하도록 처리
//             //return false;
//           }
//         });
//       }
//
//       // Split 정보 초기화
//       this.uiOption.split = {
//         by: this.splitBy[0]['value'],
//         column: this.columnCount,
//         row: this.rowCount
//       }
//     }
//
//     // 이벤트 발생
//     this.update({});
//   }
//
//   /**
//    * 레이아웃 변경 핸들러
//    * @param isColumn
//    * @param count
//    */
//   public onLayoutChange(isColumn: boolean, count: number): void {
//
//     // Validation
//     if( !count || count < 1 || count > 10 ) {
//
//       Alert.info('레이아웃은 숫자 1~10까지만 입력 가능합니다.');
//       return;
//     }
//
//     // 가로 변경
//     if( isColumn ) {
//       this.uiOption.split.column = count;
//     }
//     // 세로 변경
//     else {
//       this.uiOption.split.row = count;
//     }
//
//     // 이벤트 발생
//     this.update({});
//   }
//
//   /**
//    * Split by 변경 핸들러
//    * @param splitBy
//    */
//   public onSplitByChange(splitBy: Object): void {
//
//     // Split by 변경
//     this.uiOption.split.by = splitBy['value'];
//
//     // 이벤트 발생
//     this.update({});
//   }
//
//   /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//    | Protected Method
//    |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
//
//   /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//    | Private Method
//    |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
//
//   private initSplit(): void {
//
//     // Pivot 조건체크
//     if( this.isNotSplit() && this.uiOption ) {
//
//       // 변경된 선반이 Split 조건을 만족하지 못하면 Split 제거
//       delete this.uiOption.split;
//     }
//     // Split된 상태에서 Pivot이 변경되었다면
//     else if( !this.isNotSplit() && this.uiOption && this.uiOption.split ) {
//
//       // Split 가능 조건
//       const splitCondition: string[] = this.getSplitCondition();
//
//       // Split by 목록 초기화
//       this.splitBy = _.indexOf(splitCondition, "MEASURES") != -1 ? [{name: 'Measures', value: 'MEASURES'}] : [];
//       if( _.indexOf(splitCondition, "SERIES") != -1 ) {
//         _.each(this.pivot.aggregations, (item) => {
//           if( !_.eq(item.type, ShelveFieldType.MEASURE) ) {
//             const name: string = item.alias ? item.alias : item.fieldAlias ? item.fieldAlias : item.name;
//             this.splitBy.push({name: name, value: name});
//             // TODO: 임시로 교차 Dimension 한개만 가능하도록 처리
//             //return false;
//           }
//         });
//       }
//
//       // UI 반영
//       this.changeDetect.detectChanges();
//
//       // Split by Index 변경
//       if( this.splitByListSelect ) {
//         let isIndex: boolean = false;
//         for (let num: number = 0; num < this.splitBy.length; num++) {
//           if (this.splitBy[num]['value'] == this.uiOption.split.by) {
//             this.splitByListSelect.setDefaultIndex = num;
//             isIndex = true;
//             break;
//           }
//         }
//
//         // Split by가 목록에 없다면
//         if( !isIndex ) {
//           this.splitByListSelect.setDefaultIndex = 0;
//
//           // UI Option의 Split by를 다시 세팅한다.
//           this.uiOption.split.by = this.splitBy[0]['value'];
//
//           // 이벤트 발생
//           this.update({});
//         }
//       }
//     }
//   }
// }
