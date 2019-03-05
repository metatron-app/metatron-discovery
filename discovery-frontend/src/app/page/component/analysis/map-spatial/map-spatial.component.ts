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

  public shelf: Shelf;

  public baseList: any = {'layers': []};
  public baseIndex: number = 0;
  public compareList: any = {'layers': []};
  public compareIndex: number = 0;

  public calSpatialList: any = [
    'Intersection'
    // , 'Symmetrical difference' // 서버상에 현재 키 값이 없음
    , 'Distance within'
  ];
  public calSpatialIndex: number = 0;

  public unitList: any = [
    'Meters'
    , 'Kilometers'
  ];
  public unitIndex: number = 0;

  public unitInput: string = '100';
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
    if (!_.isUndefined(changes) && !_.isUndefined(changes['uiOption'])) {
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
    if (!_.isUndefined(this.shelf) && this.shelf.layers.length > 0) {
      let shelfIndex = 0;
      this.shelf.layers.forEach(layer => {
        if (!_.isUndefined(layer.fields) && layer.fields.length > 0) {
          layer.fields.forEach(field => {
            if (!_.isUndefined(field) && !_.isUndefined(field.field.logicalType)
              && (field.field.logicalType === LogicalType.GEO_POINT || field.field.logicalType === LogicalType.GEO_POLYGON || field.field.logicalType === LogicalType.GEO_LINE)) {
              if (!_.isUndefined(this.uiOption) && !_.isUndefined(this.uiOption.layers)
                && this.uiOption.layers.length > 0 && !_.isUndefined(this.uiOption.layers[shelfIndex].name)) {
                this.baseList.layers.push(this.uiOption.layers[shelfIndex].name);
                this.baseList['selectedNum'] = shelfIndex;
              }
            }
          });
        }
        shelfIndex++;
      });
      this.compareList.layers = [];
      if (this.baseList.layers.length > 1) {
        this.compareList.layers = _.cloneDeep(this.baseList.layers);
        this.compareList.layers = this.compareList.layers.splice(this.baseList['selectedNum'], 1);
        this.compareIndex = 0;
      }
    }
  }

  public onSelectBase(value) {
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
    this.compareList['selectedNum'] = this.compareList.layers.findIndex((compareItem) => compareItem === value);
    this.compareIndex = this.compareList['selectedNum'];
  }

  public onSelectSpatial(value) {
    this.calSpatialIndex = this.calSpatialList.findIndex((spatialItem) => spatialItem === value);
  }

  public onSelectUnit(value) {
    this.unitIndex = this.unitList.findIndex((unitItem) => unitItem === value);
  }

  public analysisBtn() {
    let baseData: string = this.baseList.layers[this.baseIndex];
    let compareData: string = this.compareList.layers[this.compareIndex];
    let spatialData: string = this.calSpatialList[this.calSpatialIndex];
    let unitData: string = this.unitList[this.unitIndex];
    if (_.isUndefined(baseData)) {
      // Alert.warning(this.translateService.instant('msg'));
      Alert.warning('기준 레이어를 선택해주세요.');
      return;
    }
    if (_.isUndefined(compareData)) {
      // Alert.warning(this.translateService.instant('msg'));
      Alert.warning('비교 레이어를 선택해주세요.');
      return;
    }
    if (_.isUndefined(spatialData)) {
      // Alert.warning(this.translateService.instant('msg'));
      Alert.warning('공간 연산 타입을 선택해주세요.');
      return;
    }
    if (_.isUndefined(this.unitInput) || this.unitInput.trim() === '' || isNaN(Number(this.unitInput.trim()))) {
      // Alert.warning(this.translateService.instant('msg'));
      Alert.warning('공간 연산 범위를 입력 또는 숫자만 가능합니다.');
      return;
    }
    let unitInputData: number = Number(this.unitInput.trim());

    if( unitData == 'Kilometers' ){
      unitInputData = unitInputData * 1000;
    }

    let spatialDataValue : string = '';
    if( spatialData == 'Intersection' ){
      spatialDataValue = 'intersects';
    } else if( spatialData == 'Distance within' ){
      spatialDataValue = 'dwithin';
    }

    let mapUIOption = (<UIMapOption>this.uiOption);
    mapUIOption.analysis = {
      type          : 'geo',
      mainLayer     : baseData,
      compareLayer  : compareData,
      operation   : {
        type      : spatialDataValue,
        distance  : unitInputData
      }
    };
    this.changeAnalysis.emit();

  }

}
