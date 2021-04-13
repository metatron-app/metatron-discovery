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

import { BaseOption } from '../base-option';
import { UIOption } from '../ui-option';
import { Orient } from '../define/common';
import { DataZoomType } from '../define/datazoom';
import * as _ from 'lodash';

/**
 * 범례 패널 converter
 */
export class LegendOptionConverter {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 범례 converter
   */
  public static convertLegend(option: BaseOption, uiOption: UIOption): BaseOption {

    // 범례 show / hide 설정
    option = this.convertLegendShow(option, uiOption);

    return option;
  }

  /**
   * 범례 show / hide 설정
   * @param option
   * @param uiOption
   */
  public static convertLegendShow(option: BaseOption, uiOption: UIOption): BaseOption {

    // auto값이 없는경우 return
    if (!uiOption.legend || _.isNull(uiOption.legend.auto) || _.isUndefined(uiOption.legend.auto)) return option;

    const show = uiOption.legend.auto;

    if (_.isUndefined(option.visualMap)) {
      option.legend.show = show;
    } else {
      option.visualMap.show = show;

      // 범례가 있는경우에만
      if (option.legend) {
        option.legend.show = false;
      }
    }

    // Grid가 존재하는 경우 범례 표시 여부에 따라 크기 변경
    if (!_.isUndefined(option.grid) && !_.isUndefined(option.dataZoom)) {
      const sliderZooms = option.dataZoom.filter((dataZoom) => {
        return _.eq(dataZoom.type, DataZoomType.SLIDER);
      });
      if (!_.isEmpty(sliderZooms)) {
        // 가로/세로 슬라이더가 모두 존재 할 경우
        _.gt(sliderZooms.length, 1) ? Orient.BOTH
          // 가로 혹은 세로 슬라이더중 1개만 존재 할 경우
          : _.eq(sliderZooms[0].orient, Orient.HORIZONTAL)
            ? Orient.VERTICAL
            : Orient.HORIZONTAL;
      }
    }

    return option;
  }
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
}
