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

import { Widget, WidgetConfiguration } from './widget';
import { Pivot } from '../../workbook/configurations/pivot';
import { Shelf } from '../../workbook/configurations/shelf/shelf';
import { CustomField } from '../../workbook/configurations/field/custom-field';
import { UIOption } from '@common/component/chart/option/ui-option';
import { Limit } from '../../workbook/configurations/limit';
import { BoardDataSource } from '../dashboard';
import {Format} from '../../workbook/configurations/format';
import { Filter } from '../../workbook/configurations/filter/filter';

export class PageWidget extends Widget {

  public imageUrl: string;
  public configuration:PageWidgetConfiguration;

  // for UI
  public mode: string = 'chart'; // chart, grid 대시보드에서 사용하는 View Mode

  constructor() {
    super();
    this.type = 'page';
    this.configuration = new PageWidgetConfiguration();

    this.mode = 'chart';
  }

} // Class - PageWidget

export class PageWidgetConfiguration extends WidgetConfiguration {

  constructor() {
    super();
    this.filters = [];
    this.type = 'page';
    this.limit = new Limit();
    this.limit.limit = 100000;
  }

  // Page 내 정의 할 수 있는 Filter
  filters: Filter[];

  // 선반내 필드 배치 정보
  pivot: Pivot;

  // Custom 필드 정보
  customFields: CustomField[];

  // Page 내 차트 설정 정보
  chart: UIOption = {};

  // 차트 Value 포맷
  format: Format;

  // Fetch 최대 Row Count 지정 및 Sorting 관련 정보
  limit: Limit;

  /**
   * Embedded Analysis 관련 설정
   */
  // Analysis analysis;
  analysis: any;

  /**
   * WorkBook 내 DataSource 정보 (Optional, DashBoard DataSource 정보가 없는 경우 함께 포함)
   */
  dataSource: BoardDataSource;

  // 선반 정보
  shelf: Shelf;

  customFunction?:string;

  sync?:boolean;

} // Class - PageWidgetConfiguration
