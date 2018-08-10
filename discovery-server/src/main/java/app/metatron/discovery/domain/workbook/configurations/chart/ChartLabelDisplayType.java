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

package app.metatron.discovery.domain.workbook.configurations.chart;

/**
 * 표시 레이블 선택
 */
public enum ChartLabelDisplayType {
  CATEGORY_NAME,        // 카테고리 명
  CATEGORY_VALUE,       // 카테고리 값
  CATEGORY_PERCENT,     // 카테고리 %
  SERIES_NAME,          // 시리즈 명
  SERIES_VALUE,         // 시리즈 값
  SERIES_PERCENT,        // 시리즈 %
  LAYER_NAME,           // 레이어명 (맵차트전용)
  LOCATION_INFO,        // 위치 정보
  DATA_VALUE            // 데이터 값
}
