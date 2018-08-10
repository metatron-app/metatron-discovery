
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

import { PageWidgetConfiguration } from './page-widget';
import { Widget } from './widget';

export class DashboardPageRelation {
  public ref: string;
  public children: DashboardPageRelation[];
}

export class DashboardWidgetRelation {

  /*-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-*/
  private readonly _widgets: Widget[] = [];

  /*-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-*/
  public id: string;
  public name: string;
  public type: string;
  public chartType: string;
  public children: DashboardWidgetRelation[];

  /*-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-*/
  constructor(rel?: DashboardPageRelation, widgets?: Widget[]) {
    if (rel && widgets) {
      this._widgets = widgets;
      this._toWidgetRelation(rel);
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-*/
  /**
   * 페이지 관계 데이터로 변환
   * @returns {DashboardPageRelation}
   */
  public toPageRelation(): DashboardPageRelation {
    const pageRel = new DashboardPageRelation();
    pageRel.ref = this.id;
    if (this.children && 0 < this.children.length) {
      pageRel.children = this.children.map(item => item.toPageRelation());
    }
    return pageRel;
  } // function - _toWidgetRelation

  /*-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-*/
  /**
   * 위젯 관계 데이터로 변환
   * @param {DashboardPageRelation} rel
   * @private
   */
  private _toWidgetRelation(rel: DashboardPageRelation) {
    if (rel) {
      if( !rel.ref && rel['pageRef'] ) {
        rel.ref = rel['pageRef'];
      }
      delete rel['pageRef'];
      const widget: Widget = this._widgets.filter(item => item.id === rel.ref)[0];
      this.id = rel.ref;
      this.name = widget.name;
      this.type = 'page';
      this.chartType = this._getWidgetType(widget);
      if (rel.children && 0 < rel.children.length) {
        this.children = rel.children.map(item => new DashboardWidgetRelation(item, this._widgets));
      }
    }
  } // function - _toWidgetRelation

  /**
   * 위젯의 타입을 얻는다. Page 위젯일 경우에는 차트에 대한 타입을 얻는다.
   * @param {Widget} widget
   * @returns {string}
   * @private
   */
  private _getWidgetType(widget: Widget): string {
    let strType: string = widget.type;
    if ('page' === widget.type) {
      strType = (<PageWidgetConfiguration>widget.configuration).chart.type.toString();
    }
    return strType;
  } // function - _getWidgetType
} // Class - DashboardPageWidgetRelation
