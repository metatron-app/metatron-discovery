
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

import * as _ from 'lodash';
import {BaseOption} from "../option/base-option";
import {UIOption, UISplit} from "../option/ui-option";
import {CHART_STRING_DELIMITER, ShelveFieldType} from "../option/define/common";
import {Pivot} from "../../../../domain/workbook/configurations/pivot";

declare let echarts: any;

export class LineChartSplit {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Getter & Setter
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Split옵션이 있는지 확인한다.
   */
  public isSplit(uiOption: UIOption): boolean {

    // Split옵션이 있는지 확인한다.
    if( uiOption.split ) {
      return true;
    }

    return false;
  }

  /**
   * Line 차트를 Split 옵션으로 변경해준다.
   */
  public setSplitData(data: any, pivot: Pivot, uiOption: UIOption, chartOption: BaseOption): BaseOption {

    // Split 옵션이 없을경우 반환한다.
    if( !this.isSplit(uiOption) ) {
      return chartOption;
    }

    // Split 정보
    const split: UISplit = uiOption.split;
    // 데이터 목록
    let list: number[] = []; //data.columns[0].value;
    // 가로 개수
    let width: number = split.column;
    // 세로 개수
    let height: number = split.row;
    // 그리드
    let grids = [];
    // X축
    let xAxes = [];
    // Y축
    let yAxes = [];
    // 시리즈
    let series = [];
    // 차트별 제목
    let titles = [];
    // Split 개수
    let count = 0;
    // 컬럼개수
    let columnCount: number = data.columns.length;
    //////////////////////////////////////////////
    // Split by dimension일경우
    //////////////////////////////////////////////
    // Measure명
    let measureName: string = "";
    // Measure가 여러개일경우 첫번째 Measure에 해당하는 Column 정보만 정제한다.
    let refineColumns: Object[] = [];
    // Split by의 aggregation에서의 index를 구한다.
    let splitByIndex: number = 0;
    let splitSeriesIndex: number[] = []; // Split내의 시리즈 목록
    let aggregationDimensionCount: number = 0;
    // 시리즈 목록
    let seriesList = [];
    // Split내의 시리즈 목록
    let splitSeriesList = {};

    for( let num = 0 ; num < columnCount ; num++ ) {

      // Split 개수가 데이터보다 작을경우 중단
      if( count >= data.columns.length ) {
        break;
      }

      // X축 데이터
      let xAxisData = [];
      data.rows.map((row) => {
        const rowNameList = _.split(row, CHART_STRING_DELIMITER);
        if (rowNameList.length >= 1) {
          // 측정값 이름은 제외
          xAxisData.push(rowNameList[0]);
          xAxisData = _.uniq(xAxisData);
        }
      });

      // 시리즈 데이터
      let seriesdata = [];

      // 교차에 등록된 Dimension Count
      let dimensionCount: number = 0;
      _.each(pivot.aggregations, (item) => {
        if( !_.eq(item.type, ShelveFieldType.MEASURE) ) {
          dimensionCount++;
        }
      });

      // 데이터 세팅
      // Measure 시리즈일경우
      if( _.eq(split.by, 'MEASURES') ) {

        ////////////////////////////////////////
        // Split by가 Measure이지만
        // 교차선반에 Dimension이 등록된 경우 처리
        ////////////////////////////////////////

        // Measure 목록
        let refineColumns: Object[] = [];
        _.each(pivot.aggregations, (item) => {
          if(  _.eq(item.type, ShelveFieldType.MEASURE) ) {
            refineColumns.push({name: item.alias, value: []});
          }
        });

        // Count가 Column 개수를 초과하면 중지
        if( count >= refineColumns.length ) {
          break;
        }

        // Measure가 여러개일경우 첫번째 Measure에 해당하는 Column 정보만 정제한다.
        _.each(refineColumns, (measure) => {

          data.columns.map((column) => {
            const columnNameList = _.split(column.name, CHART_STRING_DELIMITER);

            _.each(columnNameList, (item) => {
              if( item.indexOf(measure['name']) != -1 ) {

                _.each(column.value, (value, index) => {
                  measure['value'][index] = measure['value'][index] ? measure['value'][index] + value : value;
                });
                console.info(refineColumns);
                return false;
              }
            });
          });
        });


        ////////////////////////////////////////
        // Measure 시리즈 세팅
        ////////////////////////////////////////

        xAxisData.map((xAxis, xAxisIndex) => {
          // X축 개수만큼 데이터자리 마련
          seriesdata[xAxisIndex] = 0;

          // 쪼개져서 내려온 Row를 X축 데이터랑 비교해서 합침
          data.rows.map((row, rowIndex) => {
            const rowNameList = _.split(row, CHART_STRING_DELIMITER);
            if (xAxis == rowNameList[0]) {

              // 컬럼에서 Row랑 같은 Index의 Value를 합침
              refineColumns[count]['value'].map((value, valueIndex) => {
                if (rowIndex == valueIndex) {
                  seriesdata[xAxisIndex] += value;
                }
              });
            }
          });
        });
      }
      else {

        if( num == 0 ) {

          ////////////////////////////////////////
          // Split by가 Dimension이지만
          // Measure가 여러개 등록된 경우에 대한 처리
          ////////////////////////////////////////

          // Measure명
          //let measureName: string = "";
          _.each(pivot.aggregations, (item) => {
            if (_.eq(item.type, ShelveFieldType.MEASURE)) {
              measureName = item.alias;
              return false;
            }
          });

          // Measure가 여러개일경우 첫번째 Measure에 해당하는 Column 정보만 정제한다.
          //let refineColumns: Object[] = [];
          data.columns.map((column, columnIndex) => {
            const columnNameList = _.split(column.name, CHART_STRING_DELIMITER);
            let measureIndex = -1;
            _.each(columnNameList, (item, index) => {
              if (item.indexOf(measureName) != -1) {
                measureIndex = index;
                return false;
              }
            });

            if (measureIndex != -1) {
              refineColumns.push(column);
            }
          });

          ////////////////////////////////////////
          // 교차선반에 Dimension이 여러개일경우
          // Split by에 설정된 Dimension 기준으로 데이터 정리
          ////////////////////////////////////////


          // Split by의 aggregation에서의 index를 구한다.
          //let splitByIndex: number = 0;
          //let splitSeriesIndex: number[] = []; // Split내의 시리즈 목록
          //let aggregationDimensionCount: number = 0;
          _.each(pivot.aggregations, (item, index) => {
            if (!_.eq(item.type, ShelveFieldType.MEASURE)) {

              // 이름이 같은 Dimension을 찾았을경우
              if (item.alias.indexOf(split.by) != -1) {
                splitByIndex = aggregationDimensionCount;
                //return false;
              }
              else {
                splitSeriesIndex.push(aggregationDimensionCount);
              }

              // Dimension Count 증가
              aggregationDimensionCount++;
            }
          });

          // 시리즈 목록
          //let seriesList = [];
          refineColumns.map((column) => {
            const columnNameList = _.split(column['name'], CHART_STRING_DELIMITER);
            if (columnNameList.length >= 1) {
              seriesList.push(columnNameList[splitByIndex]);
              seriesList = _.uniq(seriesList);
            }
          });

          // Split내의 시리즈 목록
          //let splitSeriesList = {};
          // 교차선반에 Dimension이 추가로 더 있을경우 시리즈 분리를 위해 수집한다.
          if (aggregationDimensionCount > 1) {
            _.each(seriesList, (series, index) => {
              splitSeriesList[series] = [];
              let splitSeries = splitSeriesList[series];

              refineColumns.map((column) => {
                const columnNameList = _.split(column['name'], CHART_STRING_DELIMITER);
                if (columnNameList[splitByIndex] == series) {

                  _.each(splitSeriesIndex, (seriesIndex, index) => {

                    if (index == 0) {
                      splitSeries.push("");
                    }
                    else {
                      splitSeriesList[series][splitSeries.length - 1] += "-";
                    }
                    splitSeriesList[series][splitSeries.length - 1] += columnNameList[seriesIndex];
                  });
                }
              });
            });
          }
        } //if( num == 0 ) {

        // Count가 Series 개수를 초과하면 중지
        // if( count >= seriesList.length ) {
        if( (count >= seriesList.length && aggregationDimensionCount == 0)
          || (aggregationDimensionCount >= 1 && count >= refineColumns.length) ) {

          console.info("중지");
          break;
        }

        // 컬럼개수 업데이트
        //columnCount = seriesList.length;

        // 데이터 합계 계산
        xAxisData.map((xAxis, xAxisIndex) => {
          // X축 개수만큼 데이터자리 마련
          seriesdata[xAxisIndex] = 0;

          // 쪼개져서 내려온 Row를 X축 데이터랑 비교해서 합침
          data.rows.map((row, rowIndex) => {
            const rowNameList = _.split(row, CHART_STRING_DELIMITER);
            if (xAxis == rowNameList[0]) {

              // 시리즈
              refineColumns.map((column, columnIndex) => {
                if( column['name'].indexOf(seriesList[count]) != -1 ) {

                  // 컬럼에서 Row랑 같은 Index의 Value를 합침
                  column['value'].map((value, valueIndex) => {
                    if (rowIndex == valueIndex) {
                      seriesdata[xAxisIndex] += value;
                    }
                  });
                }
              });
            }
          });
        });
      }


      ////////////////////////////////////////
      // 최종 데이터 정리
      ////////////////////////////////////////

      // 그리드
      grids.push({
        show: true,
        borderWidth: 0,
        backgroundColor: '#fff',
        shadowColor: 'rgba(0, 0, 0, 0.3)',
        shadowBlur: 2
      });

      // X축
      xAxes.push({
        type: 'category',
        // 그리드 하단 패널만 X축 Label이 보이도록 처리
        show: count >= (columnCount - width) || count >= (width * height) - width,
        gridIndex: count,
        data: xAxisData
      });

      // Y축
      yAxes.push({
        type: 'value',
        show: true,
        // 그리드 좌측 패널만 Y축 Label이 보이도록 처리
        axisLabel: {
          show: (count % width === 0)
        },
        axisTick: {
          show: (count % width === 0)
        },
        gridIndex: count
      });

      // 시리즈
      series.push({
        type: 'line',
        name: data.columns[count]['name'],
        xAxisIndex: count,
        yAxisIndex: count,
        data: seriesdata,
        showSymbol: false
      });

      // 차트별 제목
      titles.push({
        textAlign: 'center',
        text: 'chart_'+count,
        textStyle: {
          fontSize: 13,
          fontWeight: 'normal'
        }
      });

      // Split개수 증가
      count++;
    }

    ////////////////////////////////////////
    // Y축 Interval 설정
    ////////////////////////////////////////

    // // Measure명
    // let measureName: string = "";
    // // Measure가 여러개일경우 첫번째 Measure에 해당하는 Column 정보만 정제한다.
    // let refineColumns: Object[] = [];
    // // Split by의 aggregation에서의 index를 구한다.
    // let splitByIndex: number = 0;
    // let splitSeriesIndex: number[] = []; // Split내의 시리즈 목록
    // let aggregationDimensionCount: number = 0;
    // // 시리즈 목록
    // let seriesList = [];
    // // Split내의 시리즈 목록
    // let splitSeriesList = {};
    console.info(series);
    console.info(seriesList);
    console.info(splitSeriesList);
    console.info(refineColumns);

    // 시리즈 목록을 루프돌며 Split 시리즈를 설정한다.
    if( aggregationDimensionCount > 1 ) {
      _.each(seriesList, (seriesName, seriesNameIndex) => { // 시리즈명 목록
        let seriesCount: number = 0;
        _.each(series, (item, index) => { // 시리즈 설정정보 목록
          const columnNameList = _.split(item.name, CHART_STRING_DELIMITER);
          if (columnNameList[splitByIndex] == seriesName) {

            // 그리드의 시리즈 Index를 기록
            grids[index]["seriesIndex"] = seriesNameIndex;

            // 스플릿 시리즈중 첫번째 데이터일 경우
            if( seriesCount == 0 ) {
              console.info(index);

              xAxes[index].show = seriesNameIndex >= (columnCount - width) || seriesNameIndex >= (width * height) - width;
              yAxes[index].show = true;
              yAxes[index].axisLabel.show = (seriesNameIndex % width === 0);
              yAxes[index].axisTick.show = (seriesNameIndex % width === 0);
            }
            // 스플릿 시리즈중 첫번째 데이터가 아닐경우
            else {
              // X축, Y축, 그림자 표시안함
              xAxes[index].show = false;
              yAxes[index].show = false;
              grids[index].borderWidth = 0;
            }
            seriesCount++;
          }
        });
      });
    }

    console.info(series);
    console.info(seriesList);
    console.info(splitSeriesList);
    console.info(refineColumns);

    ////////////////////////////////////////
    // Y축 - Min / Max 설정
    ////////////////////////////////////////

    // 레이아웃 가로가 1이라면 Y축 고정하지 않음
    if( width > 1 ) {

      // Min / Max
      let minValue: number = 0;
      let maxValue: number = 0;

      // Min / Max 찾기
      _.each(series, (item) => {
        _.each(item.data, (value) => {

          // Min
          if (value < minValue) {
            minValue = value;
          }
          // Max
          else if (value > maxValue) {
            maxValue = value;
          }
        });
      });

      // Y축 Interval
      let interval: number = Math.ceil(maxValue / 5);

      // Min / Max / interval 설정
      _.each(yAxes, (item) => {

        // 설정
        item.min = minValue;
        item.max = maxValue;
        item.interval = interval;
      });
    }


    ////////////////////////////////////////
    // 레이아웃 위치 설정
    ////////////////////////////////////////

    echarts.util.each(grids, function (grid, idx) {

      if( typeof grid["seriesIndex"] != "undefined" ) {
        idx = grid["seriesIndex"];
      }

      // TODO: 레이아웃 개수별로 간격 조절필요함
      // 가로 간격
      let marginLeft: number = 10;

      grid.left = ((idx % width) / width * 100 + marginLeft) + '%';
      grid.top = (Math.floor(idx / width) / height * 100 + 2) + '%';
      grid.width = (1 / width * 100 - marginLeft) + '%';
      grid.height = (1 / height * 100 - 6) + '%';

      titles[idx].left = parseFloat(grid.left) + parseFloat(grid.width) / 2 + '%';
      titles[idx].top = parseFloat(grid.top) + '%';

      // console.info("=====================");
      // console.info("idx : "+ idx);
      // console.info("grid.left",grid.left);
      // console.info("grid.top",grid.top);
      // console.info("grid.width",grid.width);
      // console.info("grid.height",grid.height);
      // console.info("=====================");
    });

    // 최종 Split 주입
    chartOption.grid = grids;
    chartOption.xAxis = xAxes;
    chartOption.yAxis = yAxes;
    chartOption.series = series;

    // Split에서 지원안하는 옵션 제거
    delete chartOption.dataZoom;
    delete chartOption.brush;
    delete chartOption.legend;
    delete chartOption.toolbox;

    return chartOption;
  }

}

