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

// /**
//  * Created by Dolkkok on 2017. 7. 18..
//  */
//
// import {
//   AfterViewInit, Component, ElementRef, Injector, OnInit, OnDestroy, HostListener,
//   ViewChild
// } from '@angular/core';
// import { BaseChart } from '../../base-chart';
// import {BaseOption} from "../../option/base-option";
// import {
//   ChartType, ShelveType, ShelveFieldType, LabelLayoutType
// } from '../../option/define/common';
// import {OptionGenerator} from '../../option/util/option-generator';
// import {Pivot} from "../../../../../domain/workbook/configurations/pivot";
// import * as _ from 'lodash';
// import {UIChartFormatItem} from '../../option/ui-option';
// import UI = OptionGenerator.UI;
// import {FormatOptionConverter} from "../../option/converter/format-option-converter";
// import {UILabelChart} from "../../option/ui-option/ui-label-chart";
//
// export class KPI {
//   public title: string;
//   public titleSize: number = 14;
//   public value: string;
//   public valueSize: number = 32;
//   public align: string;
//   public showLabel: boolean;
//   public showIcon: boolean;
//   public iconType: string;
//   public image: string;
//   public imageWidth: number = 86;
//   public imageHeight: number = 98;
// }
//
// @Component({
//   selector: 'label-chart-old',
//   templateUrl: 'label-chart.component.old.html'
// })
// export class LabelChartOldComponent extends BaseChart implements OnInit, OnDestroy, AfterViewInit {
//
//   /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//    | Private Variables
//    |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
//
//   @ViewChild('labelArea')
//   private area: ElementRef;
//
//   // KPI Area Element
//   private $area: any;
//   private $kpi: any;
//
//   /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//    | Protected Variables
//    |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
//
//   /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//    | Public Variables
//    |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
//
//   // KPi 엘리먼트 데이터
//   public list: KPI[] = [];
//
//   /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//    | Constructor
//    |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
//
//   // 생성자
//   constructor(
//     protected elementRef: ElementRef,
//     protected injector: Injector ) {
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
//   // After View Init
//   public ngAfterViewInit(): void {
//     this.chart = this.area;
//   }
//
//   // After Content Init
//   public ngAfterContentInit(): void {
//
//     // Area
//     this.$area = $(this.area.nativeElement);
//   }
//
//   // After View Checked
//   public ngAfterViewChecked() {
//
//     // KPI 개수만큼 사이즈 계산
//     if( this.$kpi ) {
//       let size: number = this.$kpi.length;
//       let align: string = String((<UILabelChart>this.uiOption).layout);
//       let kpi: KPI = new KPI();
//       let imageWidth: number = kpi.imageWidth;
//       let imageHeight: number = kpi.imageHeight;
//       this.$kpi.each(function(){
//
//         // KPI
//         var $item = $(this);
//
//         // 사이즈 계산
//         var titleSizePer = 500; // %
//         var resultSizePer = 1500; // %
//         var preferredSize = 2500;
//         var maxTitleSize = 150;
//         var maxValueSize = 450;
//         var scale = size == 1 ? 2.5 : size == 2 ? 1.5 : 1;
//
//         // 폰트 사이즈 설정
//         var itemWidth = $item.width();
//         var currentSize = itemWidth / size;
//         var scalePercentage = Math.sqrt(currentSize) / Math.sqrt(preferredSize);
//         var titleSize = titleSizePer * scalePercentage / scale;
//         titleSize = itemWidth <= 70 ? 0 : titleSize;
//         titleSize = titleSize > maxTitleSize ? maxTitleSize : titleSize;
//         var valueSize = resultSizePer * scalePercentage / scale;
//         valueSize = itemWidth <= 70 ? 0 : valueSize;
//         valueSize = valueSize > maxValueSize ? maxValueSize : valueSize;
//
//         // 이미지 사이즈 설정
//         var imageWidthPx = imageWidth * (scalePercentage * 5) / scale;
//         imageWidthPx = itemWidth <= 70 ? 0 : imageWidthPx;
//         imageWidthPx = imageWidthPx > (imageWidth * 1.2) ? (imageWidth * 1.2) : imageWidthPx;
//         var imageHeightPx = imageHeight * (scalePercentage * 5) / scale;
//         imageHeightPx = itemWidth <= 70 ? 0 : imageHeightPx;
//         imageHeightPx = imageHeightPx > (imageHeight * 1.2) ? (imageHeight * 1.2) : imageHeightPx;
//
//         if( align == 'VERTICAL' ) {
//         }
//
//         // 적용
//         $item.find(".ddp-icon-img").css("width", imageWidthPx + 'px');
//         $item.find(".ddp-icon-img").css("height", imageHeightPx + 'px');
//         $item.find(".ddp-txt-title").css("font-size", titleSize + '%');
//         $item.find(".ddp-data-result").css("font-size", valueSize + '%');
//       });
//     }
//   }
//
//   /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//    | Public Method
//    |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
//
//   /**
//    * 선반정보를 기반으로 차트를 그릴수 있는지 여부를 체크
//    * - 반드시 각 차트에서 Override
//    */
//   public isValid(pivot: Pivot): boolean {
//     return (this.getFieldTypeCount(pivot, ShelveType.AGGREGATIONS, ShelveFieldType.MEASURE) > 0 || this.getFieldTypeCount(pivot, ShelveType.AGGREGATIONS, ShelveFieldType.CALCULATED) > 0)
//       && (this.getFieldTypeCount(pivot, ShelveType.AGGREGATIONS, ShelveFieldType.DIMENSION) == 0 && this.getFieldTypeCount(pivot, ShelveType.AGGREGATIONS, ShelveFieldType.TIMESTAMP) == 0);
//   }
//
//   /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//    | Protected Method
//    |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
//
//   /**
//    * 차트에 설정된 옵션으로 차트를 그린다.
//    * - 각 차트에서 Override
//    * @param isKeepRange: 현재 스크롤 위치를 기억해야 할 경우
//    */
//   public draw(isKeepRange?: boolean): void {
//
//     ////////////////////////////////////////////////////////
//     // Valid 체크
//     ////////////////////////////////////////////////////////
//
//     if( !this.isValid(this.pivot) ) {
//
//       // No Data 이벤트 발생
//       this.noData.emit();
//       return;
//     }
//
//     ////////////////////////////////////////////////////////
//     // series
//     ////////////////////////////////////////////////////////
//
//     // 차트 시리즈 정보를 변환
//     this.chartOption = this.convertSeries();
//
//     ////////////////////////////////////////////////////////
//     // KPI 목록 업데이트
//     ////////////////////////////////////////////////////////
//
//     // 엘리먼트 반영
//     this.changeDetect.detectChanges();
//
//     // KPI 목록
//     this.$kpi = this.$area.find(".ddp-view-data-kpi");
//
//     // 완료
//     this.drawFinished.emit();
//   }
//
//   /**
//    * 차트의 기본 옵션을 생성한다.
//    * - 각 차트에서 Override
//    */
//   protected initOption(): BaseOption {
//     return {
//       type: ChartType.LABEL,
//       series: []
//     };
//   }
//
//   /**
//    * 시리즈 정보를 변환한다.
//    * - 필요시 각 차트에서 Override
//    * @returns {BaseOption}
//    */
//   protected convertSeries(): BaseOption {
//
//     const option: UILabelChart = <UILabelChart>this.uiOption;
//     if( _.isUndefined(option.series) ) {
//       option.series = [];
//       option.layout = LabelLayoutType.HORIZONTAL;
//     }
//
//     // 시리즈 개수
//     const seriesLength: number = this.fieldInfo.aggs.length;
//
//     // 데이터 세팅
//     this.list = [];
//     for( let num: number = 0 ; num < seriesLength ; num++ ) {
//
//       // 포맷정보
//       let format: UIChartFormatItem = !this.uiOption.valueFormat.isAll && this.uiOption.valueFormat.each.length > 0 ? this.uiOption.valueFormat.each[num] : this.uiOption.valueFormat;
//       //format = format ? format : this.uiOption.format;
//
//       // 값이 없을경우 처리
//       if( option.series.length <= num ) {
//         option.series[num] = {
//           showLabel: true,
//           showIcon: false
//         };
//       }
//
//       let kpi: KPI = new KPI();
//
//       // 텍스트 Value
//       kpi.title = this.fieldInfo.aggs[num];
//       kpi.value = FormatOptionConverter.getFormatValue(_.sum(this.data.columns[num].value), format);
//
//       // 방향
//       kpi.align = String(option.layout);
//
//       // Label명 옵션
//       kpi.showLabel = option.series[num].showLabel;
//
//       // 배경이미지 옵션
//       kpi.showIcon = option.series[num].showIcon;
//
//       // 배경이미지
//       if( kpi.showIcon ) {
//         kpi.iconType = option.series[num].iconType;
//         kpi.image = kpi.iconType == 'USER' ? './assets/images/img_chart_option/icon_kpi_user.png' :
//           kpi.iconType == 'HITS' ? './assets/images/img_chart_option/icon_kpi_hits.png' :
//             kpi.iconType == 'TIME' ? './assets/images/img_chart_option/icon_kpi_time.png' :
//               kpi.iconType == 'VIEW' ? './assets/images/img_chart_option/icon_kpi_view.png' :
//                 ''
//       }
//
//       // 추가
//       this.list.push(kpi);
//     }
//
//     // KPI 차트는 엘리먼트로 구성되지 않기 때문에 chartOption을 쓰지 않지만 override를 위해 반환
//     return this.chartOption;
//   }
//
//   /**
//    * 셀렉션 이벤트를 등록한다.
//    * - 필요시 각 차트에서 Override
//    */
//   protected selection(): void {
//     this.addChartSelectEventListener();
//     this.addChartMultiSelectEventListener();
//   }
//
//   /**
//    * 차트 Resize
//    *
//    * @param event
//    */
//   @HostListener('window:resize', ['$event'])
//   protected onResize(event) {
//   }
//
//   /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//    | Private Method
//    |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
//
//
// }
