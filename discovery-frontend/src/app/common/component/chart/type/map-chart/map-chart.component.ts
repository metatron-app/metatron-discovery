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

import { Component, ElementRef, Injector } from '@angular/core';
import { BaseChart } from '../../base-chart';
import { DatasourceService } from '../../../../../datasource/service/datasource.service';

@Component({
  selector: 'map-chart',
  templateUrl: 'map-chart.component.html'
})
export class MapChartComponent extends BaseChart {

  // 생성자
  constructor(
    protected elementRef: ElementRef,
    protected injector: Injector,
    private datasourceService: DatasourceService ) {

    super(elementRef, injector);
  }

}
