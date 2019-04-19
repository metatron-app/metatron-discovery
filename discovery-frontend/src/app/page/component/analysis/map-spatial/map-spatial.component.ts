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
import {
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import {AbstractComponent} from '../../../../common/component/abstract.component';
import {Shelf} from "../../../../domain/workbook/configurations/shelf/shelf";
import {UIMapOption} from "../../../../common/component/chart/option/ui-option/map/ui-map-chart";
import {LogicalType} from "../../../../domain/datasource/datasource";
import {Alert} from "../../../../common/util/alert.util";
import {ShelveFieldType} from "../../../../common/component/chart/option/define/common";
import {Field as AbstractField, Field} from "../../../../domain/workbook/configurations/field/field";
import {ChartUtil} from "../../../../common/component/chart/option/util/chart-util";

@Component({
  selector: 'map-spatial',
  templateUrl: './map-spatial.component.html'
})
export class MapSpatialComponent extends AbstractComponent implements OnInit, OnDestroy, OnChanges {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Output('changeAnalysisNoti')
  private changeAnalysis = new EventEmitter();

  @Input('uiOption')
  public uiOption: UIMapOption;

  @Input('shelf')
  public shelf: Shelf;

  public baseList: any = {'layers': []};
  public baseIndex: number = 0;
  public compareList: any = {'layers': []};
  public compareIndex: number = 0;

  public calSpatialList: any = [
    // {name: 'Distance within', value: 'dwithin'}
    {name: 'With In', value: 'within'}
    , {name: 'Intersection', value: 'intersects'}
    // , {name: 'Symmetrical difference', value: 'symmetricdiff'} // 서버상에 현재 키 값이 없음
  ];
  public calSpatialIndex: number = 0;

  public unitList: any = [
    {name: 'Meters', value: 'meters'}
    ,{name: 'Kilometers', value: 'kilometers'}
  ];
  public unitIndex: number = 0;
  public unitInput: string = '100';

  // buffer
  public isBufferOn: boolean = false;
  public bufferList: any = [
    {name: 'Meters', value: 'meters'}
    , {name: 'Kilometers', value: 'kilometers'}
  ];
  public bufferIndex: number = 0;
  public bufferInput: string = '100';
  // choropleth 관련 사항 (Buffer를 선택시 choropleth를 true로 설정 후 백엔드에 호출)
  // public bufferList: any = [
  //   '100'
  //   , '200'
  //   , '300'
  //   , '400'
  //   , '500'
  //   , '700'
  //   , '1000'
  // ];

  // 단계구분도 보기
  public isChoroplethOn: boolean = false;

  // dimension, measure List
  public fieldList: any = {
    measureList: [],
    dimensionList: []
  };
  public colorByIndex: number = 0;

  public aggregateTypes = [
    {name: 'SUM', value: 'SUM'},
    {name: 'AVG', value: 'AVG'},
    {name: 'CNT', value: 'COUNT'},
    {name: 'MED', value: 'MEDIAN'},
    {name: 'MIN', value: 'MIN'},
    {name: 'MAX', value: 'MAX'}
    // {name: 'PCT1/4', value: 'PERCENTILE'}, // 값 확인 필요
    // {name: 'PCT3/4', value: 'PERCENTILE'}  // 값 확인 필요
  ];
  public aggregateTypesIndex: number = 0;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    // Init
    super.ngOnInit();
  }

  // onChanges
  public ngOnChanges(changes: SimpleChanges): void {
    if (!_.isUndefined(changes) && !_.isUndefined(changes['uiOption'])
      && !_.isUndefined(changes['uiOption']['currentValue']['analysis'])
      && !_.isUndefined(changes['uiOption']['currentValue']['analysis']['use'])
      && changes['uiOption']['currentValue']['analysis']['use'] == true
      && this.baseList.layers.length > 0) {
      return;
    } else if (!_.isUndefined(changes) && !_.isUndefined(changes['uiOption']) ) {
      this.uiOption = (<UIMapOption>changes['uiOption'].currentValue);
      this.mapSpatialChanges(this.uiOption, this.shelf);
    }
  }

  // Destory
  public ngOnDestroy() {
    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | public
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public mapSpatialChanges(uiOption, shelf) {
    this.uiOption = <UIMapOption>uiOption;
    this.shelf = shelf;
    this.baseList.layers = [];
    this.compareList.layers = [];
    // 레이어가 추가/제거 될때 자동으로 selectbox의 레이어 선택
    if (!_.isUndefined(this.shelf) && this.shelf.layers.length > 0) {
      let isChanged = false;
      let shelfIndex = 0;
      this.shelf.layers.forEach(layer => {
        if (!_.isUndefined(layer.fields) && layer.fields.length > 0 && shelfIndex < 2) {
          layer.fields.forEach(field => {
            if (!_.isUndefined(field) && !_.isUndefined(field.field) && !_.isUndefined(field.field.logicalType)
              && (field.field.logicalType === LogicalType.GEO_POINT || field.field.logicalType === LogicalType.GEO_POLYGON || field.field.logicalType === LogicalType.GEO_LINE)) {
              if (!_.isUndefined(this.uiOption) && !_.isUndefined(this.uiOption.layers)
                && this.uiOption.layers.length > 0 && !_.isUndefined(this.uiOption.layers[shelfIndex].name)) {
                this.baseList.layers.push(this.uiOption.layers[shelfIndex].name);
                if (!isChanged) {
                  this.baseList['selectedNum'] = shelfIndex;
                  isChanged = true;
                }
              }
            }
          });
        }
        shelfIndex++;
      });
      if (this.baseList.layers.length > 1) {
        this.compareList.layers = _.cloneDeep(this.baseList.layers);
        this.compareList.layers.splice(this.baseList['selectedNum'], 1);
        // this.compareList.layers = this.compareList.layers.splice(this.baseList['selectedNum'], 1);
        this.compareIndex = 0;

        this.setMeasureList();

        // 기존 데이터 체크
        if( !_.isUndefined(this.uiOption.analysis) && !_.isUndefined(this.uiOption.analysis['use']) && this.uiOption.analysis['use'] ){
          let operation = this.uiOption.analysis.operation;
          this.isBufferOn = (operation.buffer == 0 ? false : true);
          if (this.isBufferOn) {
            this.isBufferOn = true;
            // buffer unit 설정
            let tempBufferIndex = 0;
            this.bufferList.forEach(buffer => {
              if (buffer.value == operation['bufferUnit']) {
                this.bufferIndex = tempBufferIndex;
              }
              tempBufferIndex++;
            });
            if (this.bufferList[this.bufferIndex].value == 'kilometers') {
              this.bufferInput = (Number(operation.buffer) / 1000).toString();
            } else {
              this.bufferInput = operation.buffer.toString();
            }
          } else {
            this.isBufferOn = false;
            this.bufferIndex = 0;
          }
          this.isChoroplethOn = operation.choropleth;
          if( this.isChoroplethOn ){
            let measureList = this.fieldList.measureList;
            for (let index = 0; index < measureList.length; index++) {
              if (_.isUndefined(operation.aggregation.type)) {
                this.colorByIndex = 0;
                break;
              }
              if( measureList[index].name == operation.aggregation.column ) {
                this.colorByIndex = index;
                break;
              }
            }
          }
          if( !_.isUndefined(operation.aggregation.type) ){
            for (let index = 0; index < this.aggregateTypes.length; index++) {
              if( this.aggregateTypes[index].name == operation.aggregation.type ) {
                this.aggregateTypesIndex = index;
                break;
              }
            }
          }
        }
      }
    }
  }

  public onSelectBase(value) {

    this.doEnableAnalysisBtn();

    this.baseList['selectedNum'] = this.baseList.layers.findIndex((baseItem) => baseItem === value);
    this.baseIndex = this.baseList['selectedNum'];
    this.compareList.layers = [];
    this.compareList.layers = _.cloneDeep(this.baseList.layers);
    this.compareList.layers = _.remove(this.compareList.layers, function (layer) {
      return layer != value;
    });
    this.compareIndex = 0;
    this.changeDetect.detectChanges();
  }

  public onSelectCompare(value) {

    this.doEnableAnalysisBtn();

    this.compareList['selectedNum'] = this.compareList.layers.findIndex((compareItem) => compareItem === value);
    this.compareIndex = this.compareList['selectedNum'];
  }

  public onSelectSpatial(value) {

    this.doEnableAnalysisBtn();

    this.calSpatialIndex = this.calSpatialList.findIndex((spatialItem) => spatialItem === value);
  }

  public onSelectUnit(value) {

    this.doEnableAnalysisBtn();

    this.unitIndex = this.unitList.findIndex((unitItem) => unitItem === value);
  }

  public bufferInputChange() {
    this.doEnableAnalysisBtn();
  }

  public onSelectBuffer(value) {

    this.doEnableAnalysisBtn();

    this.bufferIndex = this.bufferList.findIndex((unitItem) => unitItem === value);
  }

  public choroplethBtn() {

    this.doEnableAnalysisBtn();

    this.isChoroplethOn = !this.isChoroplethOn;
  }

  public bufferBtn() {

    this.doEnableAnalysisBtn();

    this.isBufferOn = !this.isBufferOn;
  }

  /**
   * select color type
   * @param item
   */
  public selectColor(item) {

    this.doEnableAnalysisBtn();

    this.colorByIndex = this.fieldList['measureList'].findIndex((colorByItem) => colorByItem === item);
  }

  /**
   * select aggregate type
   * @param item
   */
  public selectAggregate(item) {

    this.doEnableAnalysisBtn();

    this.aggregateTypesIndex = this.aggregateTypes.findIndex((aggregateItem) => aggregateItem === item);
  }

  /**
   * 공간연산 버튼
   */
  public spatialAnalysisBtn() {

    // 공간연산 실행 체크 (Validation)
    if (!_.isUndefined(this.uiOption['analysis']) && this.uiOption['analysis']['use'] == true) {
      // Alert.warning(this.translateService.instant('msg.page.chart.map.spatial.already'));
      return;
    }

    let spatialDataValue: string = this.calSpatialList[this.calSpatialIndex].value;
    let baseData: string = this.baseList.layers[this.baseIndex];
    let compareData: string = this.compareList.layers[this.compareIndex];

    let bufferData: string = this.bufferList[this.bufferIndex].value;
    let unitData: string = this.unitList[this.unitIndex].value;

    // Validation
    if (this.spatialAnalysisCommonValidation(baseData, compareData) == false) {
      return;
    }
    let mapUIOption = (<UIMapOption>this.uiOption);
    switch (spatialDataValue) {
      case 'dwithin':
        // Validation
        if (this.spatialAnalysisAdditionalValidation(bufferData, spatialDataValue) == false) {
          return;
        }
        // set data
        mapUIOption = this.dWithinSetData(baseData, compareData, unitData, spatialDataValue, mapUIOption);
        break;
      case 'within':
        // Validation
        if (this.spatialAnalysisAdditionalValidation(bufferData, spatialDataValue) == false) {
          return;
        }
        // set data
        mapUIOption = this.withinOrIntersectsSetData(baseData, compareData, bufferData, spatialDataValue, mapUIOption);
        break;
      case 'intersects':
        // Validation
        if (this.spatialAnalysisAdditionalValidation(bufferData, spatialDataValue) == false) {
          return;
        }
        // set data
        mapUIOption = this.withinOrIntersectsSetData(baseData, compareData, bufferData, spatialDataValue, mapUIOption);
        break;
      case 'symmetricdiff':
        // set data
        mapUIOption = this.symmetricalSetData(baseData, compareData, spatialDataValue, mapUIOption);
        break;
      default:
        Alert.warning(this.translateService.instant('msg.page.chart.map.spatial.select.analysis'));
        return;
    }

    this.changeAnalysis.emit(mapUIOption);
  }

  /**
   * common analysis validation
   */
  private spatialAnalysisCommonValidation(baseData: string, compareData: string): boolean {
    if (_.isUndefined(baseData)) {
      Alert.warning(this.translateService.instant('msg.page.chart.map.spatial.select.mainlayer'));
      return false;
    }
    if (_.isUndefined(compareData)) {
      Alert.warning(this.translateService.instant('msg.page.chart.map.spatial.select.comparelayer'));
      return false;
    }

    // // 기준 레이어는 무조건 point, 비교레이어는 무조건 line
    // let baseLayerNum = this.baseIndex;
    // let compareLayerNum = baseLayerNum == 0 ? 1 : 0;
    // if (this.uiOption.layers[baseLayerNum].type.toString().toLowerCase() != 'symbol') {
    //   Alert.warning(this.translateService.instant('msg.page.chart.map.spatial.mainlayer.setting'));
    //   return false;
    // } else if (this.uiOption.layers[compareLayerNum].type.toString().toLowerCase() != 'line') {
    //   Alert.warning(this.translateService.instant('msg.page.chart.map.spatial.comparelayer.setting'));
    //   return false;
    // }

    return true;
  }

  /**
   * intersects & distanceWithin validation
   */
  private spatialAnalysisAdditionalValidation(bufferData: string, spatialDataValue: string): boolean {

    // input box number만 가능
    if (_.isUndefined(this.unitInput) || this.unitInput.trim() === '' || isNaN(Number(this.unitInput.trim()))) {
      Alert.warning(this.translateService.instant('msg.page.chart.map.spatial.select.range'));
      return false;
    }
    // intersects, within 경우 buffer 값 validation
    // if ((spatialDataValue === 'intersects' || spatialDataValue === 'within')
    //   && (_.isUndefined(bufferData) || bufferData === 'Buffer')) {
    //   Alert.warning(spatialDataValue + this.translateService.instant('msg.page.chart.map.spatial.select.buffer'));
    //   return false;
    // }

    // // buffer 가 무조건 on 이여야 함
    // if (!this.isBufferOn || _.isUndefined(this.bufferInput) || this.bufferInput.trim() === '' || isNaN(Number(this.bufferInput.trim()))) {
    //   Alert.warning(this.translateService.instant('msg.page.chart.map.spatial.select.buffer'));
    //   return false;
    // }

    // // within 경우 choropleth 가 true 여야 함
    // if (spatialDataValue === 'within' && this.isChoroplethOn == false) {
    //   Alert.warning(this.translateService.instant('msg.page.chart.map.spatial.select.step'));
    //   return false;
    // }
    return true;
  }

  /**
   * distance within set data
   */
  private dWithinSetData(baseData: string, compareData: string, unitData: string, spatialDataValue: string, mapUIOption: UIMapOption): UIMapOption {

    let unitInputData: number = Number(this.unitInput.trim());
    if (unitData == 'kilometers') {
      unitInputData = unitInputData * 1000;
    }

    mapUIOption.analysis = {
      use: true,
      type: 'geo',
      // data를 위한 layer
      layerNum: 0,
      selectedLayerNum: this.baseIndex,
      mainLayer: baseData,
      compareLayer: compareData,
      operation: {
        type: spatialDataValue,
        distance: unitInputData,
        unit: unitData,
        aggregation: {
          column: this.colorByIndex == 0 ? this.fieldList['measureList'][this.colorByIndex]['alias'] : this.fieldList['measureList'][this.colorByIndex]['name'],
          type: this.aggregateTypes[this.aggregateTypesIndex]['value']
        }
      }
    };

    // 단계구분도 설정 (단계구분도 = choropleth)
    mapUIOption.analysis['operation']['choropleth'] = this.isChoroplethOn;

    return mapUIOption;
  }

  /**
   * Within & intersects set data
   */
  private withinOrIntersectsSetData(baseData: string, compareData: string, bufferData: string, spatialDataValue: string, mapUIOption: UIMapOption): UIMapOption {

    let bufferDataValue: number = Number(this.bufferInput.trim());
    if (bufferData == 'kilometers') {
      bufferDataValue = bufferDataValue * 1000;
    }

    mapUIOption.analysis = {
      use: true,
      type: 'geo',
      // data를 위한 layer
      layerNum: 0,
      selectedLayerNum: this.baseIndex,
      mainLayer: baseData,
      compareLayer: compareData,
      operation: {
        type: spatialDataValue,
        aggregation: {
          column: this.colorByIndex == 0 ? this.fieldList['measureList'][this.colorByIndex]['alias'] : this.fieldList['measureList'][this.colorByIndex]['name'],
          type: this.aggregateTypes[this.aggregateTypesIndex]['value']
        }
      }
    };

    // compare layer index 를 찾기 위함 (layer 가 두개일 경우만 가능)
    let findCompareIndex = this.baseIndex == 0 ? 1 : 0;
    // buffer 설정
    mapUIOption.analysis['operation']['bufferUnit'] = this.bufferList[this.bufferIndex].value;
    if (bufferDataValue > 0 && this.isBufferOn == true) {
      mapUIOption.analysis['operation']['buffer'] = bufferDataValue;
    } else if(this.uiOption.layers[findCompareIndex].type.toString().toLowerCase().indexOf('polygon') != -1 && this.isBufferOn == false) {
      // polygon 일 경우 min/max 값이 서버에서 전달이 명확하지 않아 아래와 같이 설정
      mapUIOption.analysis['operation']['buffer'] = 0;
    } else {
      // 이 외 타입일 경우 buffer 를 1 로 설정
      mapUIOption.analysis['operation']['buffer'] = 1;
    }

    if( mapUIOption.analysis.operation.aggregation.column == 'count' && this.colorByIndex == 0 ){
      delete mapUIOption.analysis.operation.aggregation.type;
    }

    // 단계구분도 설정 (단계구분도 = choropleth)
    mapUIOption.analysis['operation']['choropleth'] = this.isChoroplethOn;

    return mapUIOption;
  }

  /**
   * symmetrical set data
   */
  private symmetricalSetData(baseData: string, compareData: string, spatialDataValue: string, mapUIOption: UIMapOption): UIMapOption {
    mapUIOption.analysis = {
      use: true,
      type: 'geo',
      layerNum: this.baseIndex,
      mainLayer: baseData,
      compareLayer: compareData,
      operation: {
        type: spatialDataValue
      }
    };
    return mapUIOption;
  }

  /**
   * 측정값 리스트
   */
  private setMeasureList() {

    let shelf = this.shelf;

    this.fieldList = {
      measureList: [{name: 'Count', alias: 'count'}],
      dimensionList: []
    };
    let tempObj: object = {};
    let measureList: Field[];
    let dimensionList: Field[];

    for (let index = 0; index < shelf.layers.length; index++) {

      if (this.uiOption.layers[index].name != this.baseList.layers[this.baseIndex]) {
        continue;
      }

      let layers = _.cloneDeep(shelf.layers[index].fields);

      const getShelveReturnField = ((shelve: any, typeList: ShelveFieldType[]): AbstractField[] => {
        const resultList: any[] = [];
        shelve.map((item) => {
          if ((_.eq(item.type, typeList[0]) || _.eq(item.type, typeList[1])) && (item.field && ('user_expr' === item.field.type || item.field.logicalType && -1 == item.field.logicalType.indexOf('GEO')))) {
            item['alias'] = ChartUtil.getAlias(item);
            if (resultList.length == 0) {
              resultList.push({name: 'Count', alias: 'count'});
            }
            resultList.push(item);
          }
        });
        return resultList;
      });

      measureList = getShelveReturnField(layers, [ShelveFieldType.MEASURE, ShelveFieldType.CALCULATED]);
      dimensionList = getShelveReturnField(layers, [ShelveFieldType.DIMENSION, ShelveFieldType.TIMESTAMP]);
      tempObj = {
        'measureList': measureList,
        'dimensionList': dimensionList
      };
      if (measureList.length > 0)
        this.fieldList = tempObj;

    }
  }

  /**
   * 공간연산 실행 이후 option 변경시 자동으로 공간연산 실행 중단
   */
  private doEnableAnalysisBtn() {
    if(!_.isUndefined(this.uiOption.analysis) && !_.isUndefined(this.uiOption.analysis['use']) && this.uiOption.analysis['use'] == true) {
      setTimeout(() => this.changeAnalysis.emit('removeAnalysisLayerEvent'), 1000);

    }
  }

}
