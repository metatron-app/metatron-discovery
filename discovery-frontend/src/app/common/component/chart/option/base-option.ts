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
 * Created by Dolkkok on 2017. 7. 17..
 */

import {Title} from './define/title';
import {Axis, AxisPointer, Radar} from './define/axis';
import {DataZoom} from './define/datazoom';
import {Grid} from './define/grid';
import {Legend} from './define/legend';
import {Tooltip} from './define/tooltip';
import {Series} from './define/series';
import {Toolbox} from './define/toolbox';
import {Brush} from './define/brush';
import {ChartColorList, ChartType} from './define/common';
import {Visualmap} from './define/visualmap';
import {Graphic} from './define/graphic';
import {Label} from './define/label';

export interface BaseOption {

  // 차트 타입
  type?: ChartType;

  // 차트 제목
  title?: Title | Title[];

  // 차트 축/데이터가 그려지는 영역
  grid?: Grid[];

  // 차트 범례
  legend?: Legend;

  // X축
  xAxis?: Axis[];

  // Y축
  yAxis?: Axis[];

  radar?: Radar;

  // 차트의 이동/확대
  dataZoom?: DataZoom[];

  // 해당 데이터의 정보를 표시
  tooltip?: Tooltip;

  // 해당 데이터의 정보를 표시
  label?: Label;

  // 그리드 영역에서 마우스 위치에 표시되는 축 정보 가이드 속성
  axisPointer?: AxisPointer;

  // 차트 표현을 변경
  toolbox?: Toolbox;

  // 차트 영역에서 graphic객체 생상
  brush?: Brush;

  // 데이터 수치를 기준으로 색상 설정
  visualMap?: Visualmap;

  // 차트 데이터를 설정
  series?: Series[];

  // 차트 시리즈별 색상지정
  color?: ChartColorList | string[];

  graphic?: Graphic[];

  // 시리즈를 구성하는 데이터의 min/max 정보. E-Chart 에서 사용하는 속성 아님
  // 그 외에도 custom한 정보를 담고 있는 속성
  dataInfo?: any;

}





