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
  AfterViewInit,
  Component,
  ElementRef,
  Injector,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges
} from '@angular/core';
import {AbstractComponent} from '../../../../common/component/abstract.component';
import {Shelf} from "../../../../domain/workbook/configurations/shelf/shelf";
import {UIMapOption} from "../../../../common/component/chart/option/ui-option/map/ui-map-chart";
import {LogicalType} from "../../../../domain/datasource/datasource";

@Component({
  selector: 'map-spatial',
  templateUrl: './map-spatial.component.html'
})
export class MapSpatialComponent extends AbstractComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public shelf: Shelf;
  public uiOption: UIMapOption;

  public basisList: any = {'layers':[]};
  public basisIndex: number = 0;
  public compareList: any = {'layers':[]};
  public compareIndex: number = 0;

  public calSpatialList: any = [
    'Intersection'
    ,'Symmetrical difference'
    ,'Distance within'
  ];
  public calSpatialIndex: number = 0;

  public unitList: any = [
    'Meters'
    ,'Kilometers'
  ];
  public unitIndex: number = 0;

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
  }

  // afterInit
  public ngAfterViewInit(): void {
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
    this.basisList.layers = [];
    if(!_.isUndefined(this.shelf) && this.shelf.layers.length>=2) {
      let shelfIndex=0;
      this.shelf.layers.forEach(layer => {
        if(!_.isUndefined(layer.fields) && layer.fields.length>0) {
          layer.fields.forEach(field => {
            if(!_.isUndefined(field) && !_.isUndefined(field.field.logicalType)
                && (field.field.logicalType === LogicalType.GEO_POINT || field.field.logicalType === LogicalType.GEO_POLYGON || field.field.logicalType === LogicalType.GEO_LINE)) {
              if( !_.isUndefined(this.uiOption) && !_.isUndefined(this.uiOption.layers)
                  && this.uiOption.layers.length>0 && !_.isUndefined(this.uiOption.layers[shelfIndex].name)) {
                this.basisList.layers.push(this.uiOption.layers[shelfIndex].name);
                this.basisList['layerNum'] = shelfIndex;
              }
            }
          });
        }
        shelfIndex++;
      });
      this.compareList.layers = [];
      this.compareList.layers = _.cloneDeep(this.basisList.layers);
      this.compareList.layers = this.compareList.layers.splice(this.basisList['layerNum'], 1);
    }
  }

  public onSelectBasis(value) {
    this.basisList['layNum'] = this.basisIndex;
    this.compareList.layers = [];
    this.compareList.layers = _.cloneDeep(this.basisList.layers);

    this.compareList.layers = _.remove(this.compareList.layers, function(n) {
      return n != value;
    });

    this.changeDetect.detectChanges();
  }

  public onSelectCompare(value) {
    console.log(value);
  }

  public onSelectSpatial(value) {
    console.log(value);
  }

  public onSelectUnit(value) {
    console.log(value);
  }

  public analysisBtn() {
    console.log('button');
  }

}
