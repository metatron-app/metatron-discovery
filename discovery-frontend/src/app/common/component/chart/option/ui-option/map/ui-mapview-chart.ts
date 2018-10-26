import { UIOption } from '../../ui-option';
import { UILayers } from './ui-layers';
import { UITooltip } from './ui-tooltip';
import {
  AnnotationPosition, FontSize,
  GridViewType, Operator, UIFontStyle, UIOrient, UIPosition
} from '../../define/common';
/**
 * 맵뷰 화면 UI에 필요한 옵션
 * Version 2.0
 */
export interface UIMapViewChart extends UIOption {

  ////////////////////////////////////////////
  // 서버 스펙
  ////////////////////////////////////////////

  // 맵 보이기 여부
  showMapLayer?: boolean;

  // 기본지도 종류
  map?: string;

  // 라이선스 표기
  licenseNotation?: string;

  // 지역레이어 표시 여부
  showDistrictLayer?: boolean;

  // 지역 단위
  districtUnit?: string;

  // 레이어 속성
  layers?: UILayers[];

  ////////////////////////////////////////////
  // UI 스펙
  ////////////////////////////////////////////

}
