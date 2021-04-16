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

import {Component, ElementRef, Injector, Input, OnInit} from '@angular/core';
import {BaseOptionComponent} from '../base-option.component';
import * as _ from 'lodash';
import {MapType} from '@common/component/chart/option/define/map/map-common';
import {UIMapOption} from '@common/component/chart/option/ui-option/map/ui-map-chart';
import {CommonConstant} from '@common/constant/common.constant';

@Component({
  selector: 'map-common-option',
  templateUrl: './map-common-option.component.html'
})
export class MapCommonOptionComponent extends BaseOptionComponent implements OnInit {

  @Input('uiOption')
  public uiOption: UIMapOption;

  // map service list
  public mapServiceList = [{
    name: this.translateService.instant('msg.page.common.map.layer.service.openstreet'),
    value: MapType.OSM
  }];

  // map style list
  public mapStyleList = [{
    name: this.translateService.instant('msg.page.common.map.layer.map.style.light'),
    value: 'Light'
  },
    {name: this.translateService.instant('msg.page.common.map.layer.map.style.dark'), value: 'Dark'},
    {name: this.translateService.instant('msg.page.common.map.layer.map.style.colored'), value: 'Colored'}];


  constructor(protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);
  }

  // Init
  public ngOnInit() {
    super.ngOnInit();

    const propMapConf = sessionStorage.getItem(CommonConstant.PROP_MAP_CONFIG);
    if (propMapConf) {
      const objConf = JSON.parse(propMapConf);
      if (objConf.baseMaps) {
        this.mapStyleList =
          this.mapStyleList.concat(
            objConf.baseMaps.map(item => {
              return {name: item.name, value: item.name};
            })
          );
      }
      if (objConf.defaultBaseMap) {
        this.setMapStyle(this.mapStyleList.find(item => this.uiOption.style === item.name));
      }
    }
  }

  /**
   * set license
   */
  public setLicense() {

    this.uiOption = (_.extend({}, this.uiOption, {
      licenseNotation: this.uiOption.licenseNotation
    }) as UIMapOption);

    this.update();
  }

  /**
   * set map style
   * @param data
   */
  public setMapStyle(data: object) {

    this.uiOption = (_.extend({}, this.uiOption, {
      style: data['value']
    }) as UIMapOption);

    this.update();
  }

  /**
   * set map service
   * @param data
   */
  public setMapService(data: object) {

    this.uiOption = (_.extend({}, this.uiOption, {
      map: data['value']
    }) as UIMapOption);

    this.update();
  }

  /**
   * return service default index
   * @returns {number}
   */
  public findServiceDefaultIndex() {
    return _.findIndex(this.mapServiceList, {value: this.uiOption.map});
  }

  /**
   * return style default index
   * @returns {number}
   */
  public findStyleDefaultIndex() {
    return _.findIndex(this.mapStyleList, {value: this.uiOption.style});
  }

}
