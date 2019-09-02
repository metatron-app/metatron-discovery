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

export class Stats {
  // summary

  // 총 건수
  public count: number;
  // unique
  public cardinality: number;
  // outliers
  public outliers: number;
  // missing
  public missing: number;

  // statistic
  // 최저값
  public min: string;
  // 중간값
  public median: string;
  // 최대값
  public max: string;
  // Lower Quartile, Upper Quartile
  public iqr: any[];
  // 평균값
  public mean: string;
  // 표준편차
  public stddev: string;
  // 첨도
  public skewness: string;
  // 대표 데이터 타입
  public type: string;
  // 필드 내 여러개의 데이터 타입이 있을경우 타입별 숫자
  public typeDetail: any[];

  public variance: string;
  public zeros: string;

  public cdf: any[];

  public pmf: any[];
  public outlierThreshold: any[];
  public quantiles: any[];

  // 히스토그램 그래프 출력용
  public frequentItems: any[];

  // timestamp만 가지고 있는 값
  public segments: Segments[];
}

// timestamp만 가지고 있는 값
export class Segments {
  // interval
  public interval: string;
  // last access time
  public lastAccessTime: string;
  // row
  public rows: number;
  public ingestedRows: number;
  public serializedSize: number;
}
