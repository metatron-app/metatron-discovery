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

import { Injectable, Injector } from '@angular/core';
import { AbstractService } from '../../common/service/abstract.service';
import { ChartType } from '../../common/component/chart/option/define/common';
import * as _ from 'lodash';

const pivotChart: string[] = ['bar', 'line', 'control', 'scatter', 'heatmap', 'grid', 'boxplot', 'pie', 'wordcloud', 'radar', 'treemap'];

@Injectable()
export class ChartTestService extends AbstractService {

  constructor(protected injector: Injector) {
    super(injector);
  }

  // 쿼리 전송
  public search(type: string, query: any, options): Promise<any> {
    if (!_.isUndefined(query.resultFormat)) {
      query.resultFormat.mode = _.indexOf(pivotChart, type.toString()) > -1 ? type : ChartType.BAR;
      query.resultFormat.options = _.extend({}, { addMinMax: true }, options);
    }

    return this.post(this.API_URL + 'datasources/query/search', query);
  }

}
