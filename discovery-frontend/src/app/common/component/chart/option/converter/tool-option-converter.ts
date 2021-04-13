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

import { AxisType, Orient, UIOrient } from '../define/common';
import { BaseOption } from '../base-option';
import * as _ from 'lodash'
import { UIOption } from '../ui-option';
import { OptionGenerator } from '../util/option-generator';

/**
 * dataZoom, filter, grid등의 툴 converter
 */
export class ToolOptionConverter {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  ////////////////////////////////////////////////////////
  // dataZoom
  ////////////////////////////////////////////////////////

  /**
   * 확대툴 convert
   * @param option
   * @param uiOption
   * @returns {BaseOption}
   */
  public static convertDataZoom(option: BaseOption, uiOption: UIOption): BaseOption {

    // 확대툴의 show/hide 설정
    option = this.convertDataZoomShow(option, uiOption);

    // 확대 툴의 대상 축 설정
    option = this.convertDataZoomAxis(option, uiOption);

    // 확대 툴의 가로/세로에 따라서 축변환
    option = this.convertDataZoomRotate(option, uiOption);

    return option;
  }

  /**
   * 확대 툴의 대상 축 설정
   * @param option
   * @param uiOption
   */
  public static convertDataZoomShow(option: BaseOption, uiOption: UIOption): BaseOption {

    // uiOption의 zoom auto값에따라 dataZoom의 show값 설정
    _.each(uiOption.chartZooms, (zoom) => {
      _.each(option.dataZoom, (item) => {

        item.show = zoom.auto;
      })
    })

    return option;
  }

  /**
   * dataZoom show / hide 설정
   * @param option
   * @param _uiOption
   */
  public static convertDataZoomAxis(option: BaseOption, _uiOption: UIOption): BaseOption {

    if (_.isUndefined(option.toolbox)) return option;
    if (_.eq(option.xAxis[0].type, AxisType.CATEGORY)) {
      option.toolbox.feature.dataZoom.yAxisIndex = 'none';
      delete option.toolbox.feature.dataZoom.xAxisIndex;
    } else if (_.eq(option.yAxis[0].type, AxisType.CATEGORY)) {
      option.toolbox.feature.dataZoom.xAxisIndex = 'none';
      delete option.toolbox.feature.dataZoom.yAxisIndex;
    }
    return option;
  }

  /**
   * 확대 툴의 가로/세로에 따라서 축변환
   */
  public static convertDataZoomRotate(option: BaseOption, uiOption: UIOption): BaseOption {

    // orient가 없는경우 return
    if (!uiOption || _.isUndefined(uiOption['align'])) return option;

    const orient: UIOrient = uiOption['align'];

    // default일때(세로모드, x축 category, y축 value)에는 변경하지않음
    if (_.eq(orient, UIOrient.VERTICAL) && option.yAxis[0].type === AxisType.VALUE && option.xAxis[0].type === AxisType.CATEGORY) return option;

    if (_.isUndefined(option.dataZoom)) return option;
    option.dataZoom.map((obj) => {
      // 차트 방향에 따라 방향에 맞는 속성 적용
      if (_.eq(orient, UIOrient.VERTICAL)) {
        obj.orient = Orient.HORIZONTAL;
        obj.bottom = 0;
        delete obj.left;
      } else {
        obj.orient = Orient.VERTICAL;
        obj.left = 0;
        delete obj.bottom;
      }
    });

    return option;
  }

  ////////////////////////////////////////////////////////
  // filter
  ////////////////////////////////////////////////////////

  ////////////////////////////////////////////////////////
  // Grid
  ////////////////////////////////////////////////////////

  /**
   * grid converter
   * @param option
   * @param uiOption
   */
  public static convertGrid(option: BaseOption, uiOption: UIOption): BaseOption {

    // 표현방향(가로/세로)에 따른 그리드 위치값 변경
    option = this.convertGridAxisRotate(option, uiOption);

    // 레이블표시여부에 따른 그리드 값 변경
    option = this.convertGridByLabelShow(option, uiOption);

    return option;
  }

  /**
   * 레이블표시여부에 따른 그리드 bottom값 변경
   * @param {BaseOption} option
   * @param {UIOption} uiOption
   * @returns {BaseOption}
   */
  public static convertGridByLabelShow(option: BaseOption, uiOption: UIOption): BaseOption {

    // chartZoom이 없는경우 return
    if (!uiOption.chartZooms || uiOption.chartZooms.length === 0) return option;

    // chartZoom이 가로일때에는 수직모드, chartZoom이 세로일때에는 수평모드
    const orient: UIOrient = _.gt(uiOption.chartZooms.length, 1)
      // 가로/세로 슬라이더가 모두 존재 할 경우
      ? UIOrient.BOTH
      // 가로 혹은 세로 슬라이더중 1개만 존재 할 경우
      : _.eq(uiOption.chartZooms[0].orient, UIOrient.HORIZONTAL)
        ? UIOrient.VERTICAL
        : UIOrient.HORIZONTAL;

    // dataZoom이 있는축의 레이블표시가 off일때 잘리는 echart 에러 => grid값 늘려주기
    // dataZoom이 없는축의 레이블표시가 off일때 잘리는 echart 에러 => grid값 늘려주기
    option.grid.map((obj) => {

      switch(orient) {

        case UIOrient.BOTH:

          // x축 레이블 표시가 false인경우 축제목이 true인경우 (dataZoom이 있는축)
          if (false === uiOption.xAxis.showLabel && true === uiOption.xAxis.showName) {
            obj.bottom = (obj.bottom as number) + 15;
          }

          // y축 레이블 표시가 false인경우 축제목이 true인경우 (dataZoom이 있는축)
          if (false === uiOption.yAxis.showLabel && true === uiOption.yAxis.showName) {
            obj.left = (obj.left as number) + 15;
          }

          break;
        case UIOrient.VERTICAL:

          // x축 레이블 표시가 false이고 축제목이 true인경우 (dataZoom이 있는축)
          if (false === uiOption.xAxis.showLabel && true === uiOption.xAxis.showName) {
            obj.bottom = (obj.bottom as number) + 15;
          }

          // y축 레이블 표시가 false인경우 (dataZoom이 없는축)
          if (false === uiOption.yAxis.showLabel) {
            obj.left = (obj.left as number) + 20;
          }
          break;
        case UIOrient.HORIZONTAL:

          // x축 레이블 표시가 false인경우 (dataZoom이 없는축)
          if (false === uiOption.xAxis.showLabel) {
            obj.bottom = (obj.bottom as number) + 20;
          }
          // y축 레이블 표시가 false이고 축제목이 true인경우 (dataZoom이 없는축)
          if (false === uiOption.yAxis.showLabel && true === uiOption.yAxis.showName) {
            obj.left = (obj.left as number) + 15;
          }
          break;
      }
    });

    return option;
  }
  /**
   * 표현방향(가로/세로)에 따른 그리드 위치값 변경
   * @param option
   * @param uiOption
   */
  public static convertGridAxisRotate(option: BaseOption, uiOption: UIOption): BaseOption {

    // chartZoom이 없는경우 return
    if (!uiOption.chartZooms || uiOption.chartZooms.length === 0) return option;

    // chartZoom이 가로일때에는 수직모드, chartZoom이 세로일때에는 수평모드
    const orient: UIOrient = _.gt(uiOption.chartZooms.length, 1)
      // 가로/세로 슬라이더가 모두 존재 할 경우
      ? UIOrient.BOTH
      // 가로 혹은 세로 슬라이더중 1개만 존재 할 경우
      : _.eq(uiOption.chartZooms[0].orient, UIOrient.HORIZONTAL)
        ? UIOrient.VERTICAL
        : UIOrient.HORIZONTAL;

    // orient가 없는경우 return
    if (_.isUndefined(orient)) return option;

    // 범례 존재여부
    const withLegend: boolean = (!_.isUndefined(option.legend) && option.legend.show) || (!_.isUndefined(option.visualMap) && option.visualMap.show);
    // DataZoom(미니맵) 존재여부
    const withDataZooom: boolean = !_.isUndefined(option.dataZoom) && option.dataZoom[0].show;
    const withSubAxis: boolean = option.xAxis.length > 1 || option.yAxis.length > 1;

    // DataZoom(미니맵) 존재 여부에 따라서 여백 조정
    // vertical 모드일때 bottom부분의경우 dataZoom이 없는경우에도 10을 설정해줘야 짤리지 않음
    option.grid.map((_obj, idx) => {
      option.grid[idx] = _.eq(orient, UIOrient.BOTH)
        ? OptionGenerator.Grid.bothMode(10, 10, 10, 20, withLegend, withDataZooom)
        : _.eq(orient, UIOrient.VERTICAL)
          ? OptionGenerator.Grid.verticalMode(20, 10, 0, 10, withLegend, withDataZooom, withSubAxis)
          : OptionGenerator.Grid.horizontalMode(10, 0, 0, 20, withLegend, withDataZooom);
    });

    return option;
  }
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
}
