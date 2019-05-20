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

/**
 * Created by Dolkkok on 2017. 7. 18..
 */

import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {BaseChart} from '../base-chart';
import {BaseOption} from "../option/base-option";
import {
  ChartType,
  LabelLayoutType,
  LabelSecondaryIndicatorMarkType,
  LabelSecondaryIndicatorPeriod,
  LabelSecondaryIndicatorType,
  ShelveFieldType,
  ShelveType
} from '../option/define/common';
import {Pivot} from "../../../../domain/workbook/configurations/pivot";
import * as _ from 'lodash';
import {UIChartFormatItem} from '../option/ui-option';
import {FormatOptionConverter} from "../option/converter/format-option-converter";
import {
  UILabelAnnotation,
  UILabelChart,
  UILabelChartSeries,
  UILabelIcon,
  UILabelSecondaryIndicator
} from "../option/ui-option/ui-label-chart";
import {DatasourceService} from "../../../../datasource/service/datasource.service";
import {TimeCompareRequest} from "../../../../domain/datasource/data/time-compare-request";
import {SearchQueryRequest} from "../../../../domain/datasource/data/search-query-request";
import {PageWidget} from "../../../../domain/dashboard/widget/page-widget";
import {Field, FieldRole, LogicalType} from "../../../../domain/datasource/datasource";
import {Field as AbstractField} from '../../../../domain/workbook/configurations/field/field';
import {TimestampField} from "../../../../domain/workbook/configurations/field/timestamp-field";

export class KPI {
  public show: boolean;
  public title: string;
  public value: string;
  public isPositive: boolean = true;
  public align: string;
  public showLabel: boolean;
  public showIcon: boolean;
  public iconType: string;
  public image: string;
  public text: string;
  public titleSize: number = 14;
  public valueSize: number = 32;
  public imageWidth: number = 63;
  public imageHeight: number = 53;
  public imagePadding: number = 78;
  // 목표값
  public targetValue: string;
  public targetOriginalValue: string;
  // 목표값 강조여부
  public emphasized: boolean;
  // 강조여부 메시지
  public emphasizedMessage: string;
  // 목표값 양수여부
  public isTargetPositive: boolean = true;
  // 비교기간 여부
  public isPeriod: boolean = false;
}

@Component({
  selector: 'label-chart',
  templateUrl: 'label-chart.component.html'
})
export class LabelChartComponent extends BaseChart implements OnInit, OnDestroy, AfterViewInit {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild('labelArea')
  private area: ElementRef;

  // KPI Area Element
  private $area: any;
  private $kpi: any;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // @Input()
  // public query: SearchQueryRequest;


  public query: SearchQueryRequest;
  @Input("query")
  public set setQuery(query: SearchQueryRequest) {
    this.query = query;
  }


  @Input()
  public widget: PageWidget;

  // KPi 엘리먼트 데이터
  public list: KPI[] = [];

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(
    private datasourceService: DatasourceService,
    protected elementRef: ElementRef,
    protected injector: Injector ) {

    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {

    // Init
    super.ngOnInit();
  }

  // Destory
  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }

  // After View Init
  public ngAfterViewInit(): void {
    this.chart = this.area;
  }

  // After Content Init
  public ngAfterContentInit(): void {

    // Area
    this.$area = $(this.area.nativeElement);
  }

  // After View Checked
  public ngAfterViewChecked() {

    // KPI 개수만큼 사이즈 계산
    if( this.$kpi ) {
      let size: number = this.$kpi.length;
      let align: string = String((<UILabelChart>this.uiOption).layout);
      let fontSize: string = String((<UILabelChart>this.uiOption).fontSize);
      let kpi: KPI = new KPI();
      let imageWidth: number = kpi.imageWidth;
      let imageHeight: number = kpi.imageHeight;
      let imagePadding: number = kpi.imagePadding;
      let list: KPI[] = this.list;
      let count: number = 0;
      this.$kpi.each(function(){

        // KPI
        var $item = $(this);

        // 사이즈 계산
        var titleSizePer = 500; // %
        var resultSizePer = 1500; // %
        var descriptionSizePer = 450; // %
        var targetSizePer = 350; // %
        var preferredSize = 2500;
        var maxTitleSize = 150;
        var maxValueSize = 450;
        var maxDescriptionSize = 100;
        var maxTargetSize = 100;
        var scale = size == 1 ? 2.5 : size == 2 ? 1.5 : 1;
        var itemWidth = $item.width();
        var itemHeight = $item.height();

        // 폰트 사이즈 설정
        var currentSize = itemWidth / size;
        var scalePercentage = Math.sqrt(currentSize) / Math.sqrt(preferredSize);
        var titleSize = titleSizePer * scalePercentage / scale;
        titleSize = itemWidth <= 70 ? 0 : titleSize;
        titleSize = titleSize > maxTitleSize ? maxTitleSize : titleSize;
        var valueSize = resultSizePer * scalePercentage / scale;
        valueSize = itemWidth <= 70 ? 0 : valueSize;
        valueSize = valueSize > maxValueSize ? maxValueSize : valueSize;
        var descriptionSize = descriptionSizePer * scalePercentage / scale;
        descriptionSize = itemWidth <= 70 ? 0 : descriptionSize;
        descriptionSize = descriptionSize > maxDescriptionSize ? maxDescriptionSize : descriptionSize;
        var targetSize = targetSizePer * scalePercentage / scale;
        maxTargetSize = itemWidth <= 70 ? 0 : targetSize;
        maxTargetSize = targetSize > maxTargetSize ? maxTargetSize : targetSize;

        // 폰트사이즈 옵션별 사이즈조절
        if( fontSize == "SMALL" ) {
          titleSize = titleSize * 0.9;
          valueSize = valueSize * 0.9;
          descriptionSize = descriptionSize * 0.9;
          maxTargetSize = maxTargetSize * 0.9;
        }
        else if( fontSize == "NORMAL" ) {
          titleSize = titleSize * 1.1;
          valueSize = valueSize * 1.1;
          descriptionSize = descriptionSize * 1.1;
          maxTargetSize = maxTargetSize * 1.1;
        }
        else {
          titleSize = titleSize * 1.3;
          valueSize = valueSize * 1.3;
          descriptionSize = descriptionSize * 1.3;
          maxTargetSize = maxTargetSize * 1.3;
        }

        // 이미지 사이즈 설정
        var imageWidthPx = imageWidth * (scalePercentage * 5) / scale;
        imageWidthPx = itemWidth <= 70 ? 0 : imageWidthPx;
        imageWidthPx = imageWidthPx > (imageWidth * 1.2) ? (imageWidth * 1.2) : imageWidthPx;
        var imageHeightPx = imageHeight * (scalePercentage * 5) / scale;
        imageHeightPx = itemWidth <= 70 ? 0 : imageHeightPx;
        imageHeightPx = imageHeightPx > (imageHeight * 1.2) ? (imageHeight * 1.2) : imageHeightPx;
        var imagePaddingPx = imagePadding * (scalePercentage * 5) / scale;

        // 사이즈 적용
        $item.find(".ddp-img-kpi").css("width", imageWidthPx + 'px');           // Image
        $item.find(".ddp-img-kpi").css("height", imageHeightPx + 'px');         // Image
        $item.find(".ddp-txt-title").css("font-size", titleSize + '%');         // Label
        $item.find(".ddp-data-result").css("font-size", valueSize + '%');       // Value
        $item.find(".ddp-data-calen").css("font-size", descriptionSize + '%');  // Description
        $item.find(".ddp-data-value").css("font-size", maxTargetSize + '%');    // Target Value

        // 세로형일때에만 적용
        if( align == 'VERTICAL' ) {
          // 아이콘 적용시
          if( list[count].showIcon ) {
            $item.find(".ddp-area-data-kpi").css("padding-right", imagePaddingPx + 'px');
          }
          // 보조지표 강조
          if( list[count].emphasized ) {
            $item.find(".ddp-data-result3").css("font-size", titleSize + '%'); // Value
          }
        }
        // 가로형일때에만 적용
        else {
          // 보조지표 강조안함
          if( !list[count].emphasized ) {
            $item.find(".ddp-data-result2").css("font-size", titleSize + '%'); // 목표값
          }
        }


        // 설명 Show / Hide 설정
        if( itemHeight < 100 ) {
          $item.find(".ddp-data-calen").hide();
        }
        else {
          $item.find(".ddp-data-calen").show();
        }

        // 인덱스증가
        count++;
      });
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 선반정보를 기반으로 차트를 그릴수 있는지 여부를 체크
   * - 반드시 각 차트에서 Override
   */
  public isValid(pivot: Pivot): boolean {
    return (this.getFieldTypeCount(pivot, ShelveType.AGGREGATIONS, ShelveFieldType.MEASURE) > 0 || this.getFieldTypeCount(pivot, ShelveType.AGGREGATIONS, ShelveFieldType.CALCULATED) > 0)
      && (this.getFieldTypeCount(pivot, ShelveType.AGGREGATIONS, ShelveFieldType.DIMENSION) == 0 && this.getFieldTypeCount(pivot, ShelveType.AGGREGATIONS, ShelveFieldType.TIMESTAMP) == 0);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 차트에 설정된 옵션으로 차트를 그린다.
   * - 각 차트에서 Override
   * @param isKeepRange: 현재 스크롤 위치를 기억해야 할 경우
   */
  public draw(isKeepRange?: boolean): void {

    ////////////////////////////////////////////////////////
    // Valid 체크
    ////////////////////////////////////////////////////////

    if( !this.isValid(this.pivot) ) {

      // No Data 이벤트 발생
      this.noData.emit();
      return;
    }

    ////////////////////////////////////////////////////////
    // series
    ////////////////////////////////////////////////////////

    // 차트 시리즈 정보를 변환
    this.chartOption = this.convertSeries();

    ////////////////////////////////////////////////////////
    // KPI 목록 업데이트
    ////////////////////////////////////////////////////////

    // 엘리먼트 반영
    this.changeDetect.detectChanges();

    // KPI 목록
    this.$kpi = this.$area.find(".ddp-view-data-kpi");

    // 완료
    this.drawFinished.emit();
  }

  /**
   * 차트의 기본 옵션을 생성한다.
   * - 각 차트에서 Override
   */
  protected initOption(): BaseOption {
    return {
      type: ChartType.LABEL,
      series: []
    };
  }

  /**
   * 시리즈 정보를 변환한다.
   * - 필요시 각 차트에서 Override
   * @returns {BaseOption}
   */
  protected convertSeries(): BaseOption {

    const option: UILabelChart = <UILabelChart>this.uiOption;
    if( _.isUndefined(option.series) ) {
      option.series = [];
      option.layout = LabelLayoutType.HORIZONTAL;
    }

    // 시리즈 개수
    const seriesLength: number = this.fieldInfo.aggs.length;

    // 이전스펙 마이그레이션
    if( _.isUndefined(option.icons) && option.series.length > 0 ) {
      option.icons = [];
      option.annotations = [];
      option.secondaryIndicators = [];
      if( option.series[0]['showLabel'] ) {
        option.showLabel = true;
      }
    }

    // 데이터 세팅
    this.list = [];
    let series: UILabelChartSeries[] = [];
    let icons: UILabelIcon[] = [];
    let annotations: UILabelAnnotation[] = [];
    let secondaryIndicators: UILabelSecondaryIndicator[] = [];
    for( let num: number = 0 ; num < seriesLength ; num++ ) {

      // 포맷정보
      let format: UIChartFormatItem = !this.uiOption.valueFormat.isAll && this.uiOption.valueFormat.each.length > 0 ? this.uiOption.valueFormat.each[num] : this.uiOption.valueFormat;
      //format = format ? format : this.uiOption.format;

      // 값이 없을경우 처리
      const field: any = this.pivot.aggregations[num];
      let alias: any = field['alias'] ? field['alias'] : field['fieldAlias'] ? field['fieldAlias'] : field['name'];
      //let displayName: any = field['alias'] ? field['alias'] : field['fieldAlias'] ? field['fieldAlias'] : field['name'];
      let displayName: any = this.fieldInfo.aggs[num];
      if( field.aggregationType
          && field.aggregationType != ""
          && alias.indexOf(field.aggregationType +"(") == -1 ) {
        alias = this.pivot.aggregations[num].aggregationType +"("+ alias +")";
      }
      //const alias: any = this.pivot.aggregations[num].alias;

      /////////////////////
      // Pivot이 추가되었을때 처리
      /////////////////////

      //if( option.series.length <= num || option.series.length != seriesLength ) {
      if( option.series.length <= num ) {
        if( num > 0 ) {
          option.series[num] = {
            name: alias,
            displayName: displayName
          };
          option.icons[num] = {
            seriesName: alias,
            displayName: displayName,
            show: option.icons[0].show,
            iconType: option.icons[0].iconType
          };
          option.annotations[num] = {
            seriesName: alias,
            displayName: displayName,
            show: option.annotations[0].show,
            description: option.annotations[0].description
          };
          option.secondaryIndicators[num] = {
            seriesName: alias,
            displayName: displayName,
            show: option.secondaryIndicators[0].show,
            indicatorType: option.secondaryIndicators[0].indicatorType,
            rangeUnit: option.secondaryIndicators[0].rangeUnit,
            targetValue: option.secondaryIndicators[0].targetValue,
            mark: option.secondaryIndicators[0].mark,
            emphasized: option.secondaryIndicators[0].emphasized

          };
        }
        else {
          option.series[num] = {};
          option.icons[num] = {};
          option.annotations[num] = {};
          option.secondaryIndicators[num] = {};
        }
      }
      if( _.isUndefined(option.series[num].name)
        || _.isUndefined(option.icons[num].seriesName)
        || _.isUndefined(option.annotations[num].seriesName)
        || _.isUndefined(option.secondaryIndicators[num].seriesName) ) {
        option.series[num].name = alias;
        option.series[num].displayName = displayName;
        option.icons[num].seriesName = alias;
        option.icons[num].displayName = displayName;
        option.annotations[num].seriesName = alias;
        option.annotations[num].displayName = displayName;
        option.secondaryIndicators[num].seriesName = alias;
        option.secondaryIndicators[num].displayName = displayName;
      }

      // 이전스펙 마이그레이션
      if( _.isUndefined(option.icons[num]) ) {
        option.icons[num] = {
          show: option.series[num]['showIcon'],
          iconType: option.series[num]['iconType']
        };
        option.annotations[num] = {};
        option.secondaryIndicators[num] = {};
        option.series[num] = {};
      }

      /////////////////////
      // Pivot의 순서가 변경되었을때 처리
      /////////////////////

      let isPush: boolean = false;
      for( let num2: number = 0 ; num2 < this.pivot.aggregations.length ; num2++ ) {
        if( option.series.length >= (num2+1) && _.eq(alias, option.series[num2].name) ) {
          isPush = true;
          series.push(option.series[num2]);
        }
        if( option.icons.length >= (num2+1) && _.eq(alias, option.icons[num2].seriesName) ) {
          icons.push(option.icons[num2]);
        }
        if( option.annotations.length >= (num2+1) && _.eq(alias, option.annotations[num2].seriesName) ) {
          annotations.push(option.annotations[num2]);
        }
        if( option.secondaryIndicators.length >= (num2+1) && _.eq(alias, option.secondaryIndicators[num2].seriesName) ) {
          secondaryIndicators.push(option.secondaryIndicators[num2]);
        }
      }

      /////////////////////
      // Change alias process
      /////////////////////

      if( !isPush ) {
        option.series[num].name = alias;
        option.series[num].displayName = displayName;
        option.icons[num].seriesName = alias;
        option.icons[num].displayName = displayName;
        option.annotations[num].seriesName = alias;
        option.annotations[num].displayName = displayName;
        option.secondaryIndicators[num].seriesName = alias;
        option.secondaryIndicators[num].displayName = displayName;

        for( let num2: number = 0 ; num2 < this.pivot.aggregations.length ; num2++ ) {
          if( option.series.length >= (num2+1) && _.eq(alias, option.series[num2].name) ) {
            series.push(option.series[num2]);
          }
          if( option.icons.length >= (num2+1) && _.eq(alias, option.icons[num2].seriesName) ) {
            icons.push(option.icons[num2]);
          }
          if( option.annotations.length >= (num2+1) && _.eq(alias, option.annotations[num2].seriesName) ) {
            annotations.push(option.annotations[num2]);
          }
          if( option.secondaryIndicators.length >= (num2+1) && _.eq(alias, option.secondaryIndicators[num2].seriesName) ) {
            secondaryIndicators.push(option.secondaryIndicators[num2]);
          }
        }
      }
    }

    // 변경된 순서 반영
    option.series = series;
    option.icons = icons;
    option.annotations = annotations;
    option.secondaryIndicators = secondaryIndicators;

    if( seriesLength != option.series.length ) {
      (option).series = (option).series.slice(0, seriesLength);
      (option).icons = (option).icons.slice(0, seriesLength);
      (option).annotations = (option).annotations.slice(0, seriesLength);
      (option).secondaryIndicators = (option).secondaryIndicators.slice(0, seriesLength);
    }

    // Calculate secondary indicators
    for( let num: number = 0 ; num < seriesLength ; num++ ) {

      // 포맷정보
      let format: UIChartFormatItem = !this.uiOption.valueFormat.isAll && this.uiOption.valueFormat.each.length > 0 ? this.uiOption.valueFormat.each[num] : this.uiOption.valueFormat;

      // KPI Info
      let kpi: KPI = new KPI();
      let kpiValue: number = _.sum(this.data.columns[num].value);

      // 텍스트 Value
      kpi.title = this.fieldInfo.aggs[num];
      kpi.isPositive = kpiValue >= 0;
      kpi.value = FormatOptionConverter.getFormatValue(kpiValue, format);

      // 방향
      kpi.align = String(option.layout);

      // Label명 옵션
      kpi.showLabel = option.showLabel;

      // 배경이미지 옵션
      kpi.showIcon = option.icons[num].show;

      // 배경이미지
      if( kpi.showIcon ) {
        kpi.iconType = option.icons[num].iconType ? option.icons[num].iconType : 'USER';
      }

      // 설명
      kpi.text = option.annotations[num].show ? option.annotations[num].description : null;
      kpi.isPeriod = false;
      kpi.show = true;

      // 목표값
      if( option.secondaryIndicators[num].show
        && !_.eq(option.secondaryIndicators[num].indicatorType, LabelSecondaryIndicatorType.PERIOD)
        && option.secondaryIndicators[num].targetValue
        && option.secondaryIndicators[num].targetValue != 0 ) {

        let value: number = kpiValue - option.secondaryIndicators[num].targetValue;
        // 목표값 양수여부
        kpi.isTargetPositive = value >= 0;
        // 절대값으로 변경
        value = Math.abs(value);
        // 퍼센트
        if( _.eq(option.secondaryIndicators[num].mark, LabelSecondaryIndicatorMarkType.PERCENTAGE) ) {
          value = ((kpiValue / option.secondaryIndicators[num].targetValue) - 1) * 100;
        }
        // 소수점 자리수
        value = Math.floor(Number(value) * (Math.pow(10, 1))) / Math.pow(10, 1);
        // 천단위 표시
        kpi.targetValue = value.toLocaleString();
        kpi.targetOriginalValue = (Math.floor(Number(option.secondaryIndicators[num].targetValue) * (Math.pow(10, 1))) / Math.pow(10, 1)).toLocaleString();
        // 퍼센트 표시
        if( _.eq(option.secondaryIndicators[num].mark, LabelSecondaryIndicatorMarkType.PERCENTAGE) ) {
          kpi.targetValue += "%"
        }
        // 강조여부
        kpi.emphasized = option.secondaryIndicators[num].emphasized;
        kpi.emphasizedMessage = this.translateService.instant('msg.page.common.kpi.indocator.standard');
      }
      // 비교기간
      else if( option.secondaryIndicators[num].show
        && _.eq(option.secondaryIndicators[num].indicatorType, LabelSecondaryIndicatorType.PERIOD) ) {

        ////////////////////////////////////////////////////////////
        // 비교기간 데이터 조회
        ////////////////////////////////////////////////////////////

        if( _.isUndefined(this.query) || _.isUndefined(this.widget) ) {
          return;
        }

        //////////////////////////////
        // 타임필드 세팅
        //////////////////////////////

        const fields: Field[] = (this.widget.dashBoard.configuration.fields) ? this.widget.dashBoard.configuration.fields : [];
        const idx: number = _.findIndex(fields, { role: FieldRole.TIMESTAMP, logicalType: LogicalType.TIMESTAMP });
        const timeField: AbstractField = new TimestampField();
        timeField.name = fields[idx].name;
        timeField.alias = fields[idx].alias;
        //timeField.granularity = fields[idx].granularity;
        timeField.format = {
          type: "time_format",
          format: "yyyy-MM-dd HH:mm:ss",
          timeZone: "UTC",
          locale: "en"
        };

        //////////////////////////////
        // Measure 세팅
        //////////////////////////////

        const measures: AbstractField[] = [];
        _.each(this.pivot.aggregations, (measure, index) => {
          const alias: any = measure['field']['alias'];
          if( index == num ) {
            measures.push(measure);
          }
        });

        //////////////////////////////
        // 파라미터 세팅
        //////////////////////////////

        let query: TimeCompareRequest = new TimeCompareRequest();
        query.dataSource = this.query.dataSource;
        query.filters = this.query.filters;
        query.userFields = this.query.userFields;
        query.timeField = timeField;
        query.measures = measures;
        query.timeUnit = String(option.secondaryIndicators[num].rangeUnit);
        query.value = 1;
        query.timeZone = "Asia/Seoul";

        //////////////////////////////
        // 데이터 조회
        //////////////////////////////

        this.datasourceService.timeCompareQuery(query).then( (data) => {

          if( _.isUndefined(option.secondaryIndicators[num]) ) {
            return;
          }

          ////////////////////////////////////////////////////////////
          // //비교기간 데이터 조회
          ////////////////////////////////////////////////////////////

          kpiValue = 0;
          for (let key in data.current[0]) {
            kpiValue = data.current[0][key];
          }
          let targetValue = 0;
          for (let key in data.previous[0]) {
            targetValue = data.previous[0][key];
          }

          kpi.isPeriod = true;
          kpi.isPositive = kpiValue >= 0;
          kpi.value = FormatOptionConverter.getFormatValue(kpiValue, format);

          let value: number = kpiValue - targetValue;
          // 목표값 양수여부
          kpi.isTargetPositive = value >= 0;
          // 절대값으로 변경
          value = Math.abs(value);
          // 퍼센트
          if( _.eq(option.secondaryIndicators[num].mark, LabelSecondaryIndicatorMarkType.PERCENTAGE) ) {
            value = ((kpiValue / targetValue) - 1) * 100;
          }
          // 소수점 자리수
          value = Math.floor(Number(value) * (Math.pow(10, 1))) / Math.pow(10, 1);

          // NaN일 경우 처리
          if( isNaN(value) ) { value = 0; }

          // 천단위 표시
          kpi.targetValue = value.toLocaleString();
          kpi.targetOriginalValue = (Math.floor(Number(targetValue) * (Math.pow(10, 1))) / Math.pow(10, 1)).toLocaleString();
          // 퍼센트 표시
          if( _.eq(option.secondaryIndicators[num].mark, LabelSecondaryIndicatorMarkType.PERCENTAGE) ) {
            kpi.targetValue += "%"
          }
          // 강조여부
          kpi.emphasized = option.secondaryIndicators[num].emphasized;
          if( _.eq(option.secondaryIndicators[num].rangeUnit, LabelSecondaryIndicatorPeriod.YEAR )) {
            kpi.emphasizedMessage = this.translateService.instant('msg.page.common.kpi.indocator.period.year');
          }
          else if( _.eq(option.secondaryIndicators[num].rangeUnit, LabelSecondaryIndicatorPeriod.MONTH )) {
            kpi.emphasizedMessage = this.translateService.instant('msg.page.common.kpi.indocator.period.month');
          }
          else if( _.eq(option.secondaryIndicators[num].rangeUnit, LabelSecondaryIndicatorPeriod.DAY )) {
            kpi.emphasizedMessage = this.translateService.instant('msg.page.common.kpi.indocator.period.day');
          }
          else if( _.eq(option.secondaryIndicators[num].rangeUnit, LabelSecondaryIndicatorPeriod.HOUR )) {
            kpi.emphasizedMessage = this.translateService.instant('msg.page.common.kpi.indocator.period.hour');
          }
          kpi.show = true;

          this.changeDetect.detectChanges();
          this.ngAfterViewChecked();
        });

        kpi.show = false;
      }

      // 추가
      this.list.push(kpi);
    }


    // KPI 차트는 엘리먼트로 구성되지 않기 때문에 chartOption을 쓰지 않지만 override를 위해 반환
    return this.chartOption;
  }

  /**
   * 차트 Resize
   *
   * @param event
   */
  @HostListener('window:resize', ['$event'])
  protected onResize(event) {
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
