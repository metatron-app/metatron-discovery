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
 * "Search" 쿼리용 Request 객체
 */
import * as _ from 'lodash';
import {Filter} from '../../workbook/configurations/filter/filter';
import {Shelf} from '../../workbook/configurations/shelf/shelf';
import {Pivot} from '../../workbook/configurations/pivot';
import {Field} from '../../workbook/configurations/field/field';
import {UserDefinedField} from '../../workbook/configurations/field/user-defined-field';
import {Limit} from '../../workbook/configurations/limit';
import {Analysis} from '../../../page/component/value/analysis';
import {BoardDataSource} from '../../dashboard/dashboard';

export class SearchQueryRequest {

  /**
   * 질의할 DataSource 정보
   */
    // dataSource: BoardDataSource;
    // 일반 차트 : BoardDataSource, 맵 차트 : MapDataSource
  dataSource: any;

  /**
   * Filter 정보
   */
  filters: Filter[];

  selectionFilters: Filter[];

  /**
   * Column/Row 관련 정보
   */
  pivot: Pivot;

  /**
   * map shelf info
   */
  shelf: Shelf;

  /**
   * projection 에 넣는 MeasureField 에 aggregationType 이 null 인 경우 Select 구문 수행, 아닌 경우 GroupBy 구문 수행
   * <br/> (이때 모든 MeasureField 는 동일하게 aggregationType 이 존재하거나 없어야함, Validation 체크 필요)
   */
  projections: Field[];

  /**
   * 기존 정의되어 있는 Field 외 가상 필드 정의
   */
  userFields: UserDefinedField[];

  /**
   * Fetch 최대 Row Count 지정 및 Sorting 관련 정보
   */
  limits: Limit;

  /**
   * Optional, 필요한 경우 resultFormat 지정
   */
    // SearchResultFormat resultFormat;
  resultFormat?: any;

  /**
   * Optional, 내부적으로 결과 값을 Forwarding 하도록 지정
   */
    // ResultForward resultForward;
  resultForward?: any;

  /**
   * 쿼리 개별 설정
   */
  // Map<String, Object> context;
  // context: any;

  /**
   * Optional, SelectQuery의 경우 결과에 대한 Meta정보 처리 수행위한 플래그
   */
  // Boolean metaQuery = false;

  /**
   * Optional, Preview 모드일때 필수필터의 영향을 받지 않도록 구성
   */
  // Boolean preview = false;

  /**
   * Embedded Analysis 관련 설정
   */
  analysis: Analysis;

  /**
   * 호출 추적 관련 정보
   * > Key : discovery.route.uri, Value : 호출한 내부 화면 URI
   * > Key : discovery.dashboard.id, Value : 어떤 대시보드에서 호출했는지 여부
   * > Key : discovery.widget.id, Value : 어떤 위젯에서에서 호출했는지 여부
   */
  context: any;

  // value alias 조회시 설정필요
  // valueAliasRef: string;

  aliases: SearchQueryAlias[];

  public getDownloadFilters(): Filter[] {
    let downloadFilters: Filter[];
    if (this.filters) {
      downloadFilters = _.cloneDeep(this.filters);
    } else {
      downloadFilters = [];
    }

    return this.selectionFilters ? downloadFilters.concat(this.selectionFilters) : downloadFilters;
  }

}

export class SearchQueryAlias {
  type: string;
  codes?: any;
  ref?: string;
}

export class MapDataSource {
  type: string;
  dataSources: BoardDataSource[]
}
