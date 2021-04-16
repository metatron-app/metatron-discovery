/**
 * Created by Dolkkok on 2017. 7. 20..
 */

import {ChartType, FontSize} from './define/common';
import {Field} from '@domain/workbook/configurations/field/field';
import {UIChartColor} from './ui-option/ui-color';
import {UIChartZoom} from './ui-option/ui-zoom';
import {UIChartLegend} from './ui-option/ui-legend';
import {UIChartAxis} from './ui-option/ui-axis';
import {UIChartFormat} from './ui-option/ui-format';
import {UIChartDataLabel} from './ui-option/ui-datalabel';
import {UIChartTooltip} from './ui-option/ui-tooltip';

/**
 * Export
 */
export * from './ui-option/ui-bar-chart';
export * from './ui-option/ui-line-chart';
export * from './ui-option/ui-label-chart';
export * from './ui-option/ui-color';
export * from './ui-option/ui-datalabel';
export * from './ui-option/ui-format';
export * from './ui-option/ui-zoom';
export * from './ui-option/ui-legend';
export * from './ui-option/ui-axis';
export * from './ui-option/map/ui-layers';

/**
 * 화면 UI에 필요한 옵션
 * Version 2.0
 */
export interface UIOption {

  // 버전관리용
  version?: number;

  ////////////////////////////////////////////
  // 서버 스펙
  ////////////////////////////////////////////

  type?: ChartType;

  color?: UIChartColor;

  dataLabel?: UIChartDataLabel;

  valueFormat?: UIChartFormat;

  legend?: UIChartLegend;

  chartZooms?: UIChartZoom[];

  xAxis?: UIChartAxis;

  yAxis?: UIChartAxis;

  // Secondary Axis
  secondaryAxis?: UIChartAxis;

  // 폰트 사이즈
  fontSize?: FontSize;

  // 툴팁
  toolTip?: UIChartTooltip;

  limit?: number;

  ////////////////////////////////////////////
  // UI 스펙
  ////////////////////////////////////////////

  series?: object;

  size?: number;

  // limit check 여부
  limitCheck?: boolean;

  // etc
  // 색상의 기준이 되는 행/열 필드 리스트
  fieldList?: string[];

  // 사용자 색상 리스트에서 사용되는 measure 리스트
  fieldMeasureList?: Field[];

  // 사용자 색상 리스트에서 사용되는 dimension 리스트
  fielDimensionList?: Field[];

  // dimension 데이터 리스트
  fieldDimensionDataList?: string[];

  // 데이터 최소값
  minValue?: number;

  // 데이터 최대값
  maxValue?: number;

  // 스택 데이터 최소값
  stackedMinValue?: number;

  // 스택 데이터 최대값
  stackedMaxvalue?: number;

  // TODO: 임시용 Split
  split?: UISplit;
}

export interface UISplit {

  // Split by (컬럼명)
  by: string;

  // 레이아웃: 가로 개수
  column: number;

  // 레이아웃: 세로 개수
  row: number;
}
