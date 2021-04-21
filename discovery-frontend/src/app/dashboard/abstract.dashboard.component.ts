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
import {AbstractComponent} from '@common/component/abstract.component';
import {CommonUtil} from '@common/util/common.util';
import {Datasource} from '@domain/datasource/datasource';
import {Widget} from '@domain/dashboard/widget/widget';
import {WidgetShowType} from '@domain/dashboard/dashboard.globalOptions';
import {Filter} from '@domain/workbook/configurations/filter/filter';
import {Dashboard, DashboardWidgetRelation, LayoutWidgetInfo} from '@domain/dashboard/dashboard';
import {FilterWidget, FilterWidgetConfiguration} from '@domain/dashboard/widget/filter-widget';
import {DashboardUtil} from './util/dashboard.util';

export class AbstractDashboardComponent extends AbstractComponent {

  /**
   * Convert spec to UI
   * @param {Dashboard} boardInfo
   * @return {Dashboard}
   */
  public convertSpecToUI(boardInfo: Dashboard): Dashboard {
    // Change spec server to ui ( userDefinedFields -> customFields )
    if (boardInfo.configuration['userDefinedFields']) {
      boardInfo.configuration.customFields = _.cloneDeep(CommonUtil.objectToArray(boardInfo.configuration['userDefinedFields']));
    }

    if (boardInfo.dataSources) {
      // Filter ( dataSource ( id -> engineName ) )
      const filters: Filter[] = DashboardUtil.getBoardFilters(boardInfo);
      if (filters && 0 < filters.length) {
        const uniqFilterKeyList: string[] = [];
        boardInfo.configuration.filters
          = filters.filter((filter: Filter) => {
          const uniqFilterKey: string = filter.dataSource + '_' + filter.field;
          if (-1 === uniqFilterKeyList.indexOf(uniqFilterKey)) {
            const filterDs: Datasource = boardInfo.dataSources.find(ds => ds.id === filter.dataSource);
            (filterDs) && (filter.dataSource = filterDs.engineName);
            if (this.isNullOrUndefined(filter.dataSource)) {
              const fieldDs: Datasource = boardInfo.dataSources.find(ds => ds.fields.some(item => item.name === filter.field));
              (fieldDs) && (filter.dataSource = fieldDs.engineName);
            }
            uniqFilterKeyList.push(uniqFilterKey);
            return true;
          } else {
            return false;
          }
        });
      }
      // Widget
      const widgets: Widget[] = boardInfo.widgets;
      if (widgets && 0 < widgets.length) {
        widgets.forEach((widget: Widget) => {
          if ('filter' === widget.type) {
            // FilterWidget : Filter ( dataSource ( id -> engineName ) )
            const conf: FilterWidgetConfiguration = widget.configuration as FilterWidgetConfiguration;
            const filterDs: Datasource = boardInfo.dataSources.find(ds => ds.id === conf.filter.dataSource);
            (filterDs) && (conf.filter.dataSource = filterDs.engineName);

            if (this.isNullOrUndefined(conf.filter.dataSource)) {
              const fieldDs: Datasource = boardInfo.dataSources.find(ds => ds.fields.some(item => item.name === conf.filter.field));
              (fieldDs) && (conf.filter.dataSource = fieldDs.engineName);
            }
          }
        });
      }
    }

    return boardInfo;
  } // function - convertSpecToUI


  /**
   * 부모차트 목록 조회
   */
  public getParentFilter(filter: Filter, board: Dashboard): Filter[] {
    let prevFilter: Filter[] = [];
    const filterWidget: FilterWidget = DashboardUtil.getFilterWidgetByFilter(board, filter);
    if (board.configuration.filterRelations && filterWidget) {
      this._findWidgetRelation(filterWidget.id, board.configuration.filterRelations, [],
        (_target: DashboardWidgetRelation, hierarchy: string[]) => {
          if (0 < hierarchy.length) {
            prevFilter = hierarchy.map(item => {
              const conf: FilterWidgetConfiguration = (DashboardUtil.getWidget(board, item) as FilterWidget).configuration;
              return DashboardUtil.getBoardFilter(board, conf.filter.dataSource, conf.filter.field);
            });
          }
          return true;
        }, board);
    }
    return prevFilter.filter(item => !!item);
    // prevFilter = prevFilter.filter(item => !!item);
    // if (isOnlyExistValue) {
    //   return prevFilter.filter(item => (<InclusionFilter>item).valueList && 0 < (<InclusionFilter>item).valueList.length);
    // } else {
    //   return prevFilter;
    // }
  } // function - getParentFilter

  /**
   * 위젯을 추가 및 Layout 내 위젯이 배치될 수 있도록 목록 등록
   * @param {Dashboard} board
   * @param {Widget} widget
   * @param {boolean} isInLayout
   * @returns {Dashboard}
   * @protected
   */
  protected _addWidget(board: Dashboard, widget: Widget, isInLayout: boolean = false): Dashboard {
    board.widgets.push(widget);

    const newWidget: LayoutWidgetInfo = new LayoutWidgetInfo(widget.id, widget.type);
    (isInLayout) && (newWidget.isInLayout = true);
    if (WidgetShowType.BY_WIDGET !== board.configuration.options.widget.showTitle) {
      newWidget.title = (WidgetShowType.ON === board.configuration.options.widget.showTitle);
    }
    (board.configuration.widgets) || (board.configuration.widgets = []);
    board.configuration.widgets.push(newWidget);

    if ('page' === widget.type) {
      (board.configuration.relations) || (board.configuration.relations = []);
      this._addWidgetRelation(widget.id, board.configuration.relations);
    } else if ('filter' === widget.type) {
      (board.configuration.filterRelations) || (board.configuration.filterRelations = []);
      this._addWidgetRelation(widget.id, board.configuration.filterRelations, board);
    }

    return board;
  } // function - addWidget

  /**
   * 위젯 삭제
   * @param {Dashboard} board
   * @param {string} widgetId
   * @returns {Dashboard}
   * @protected
   */
  protected _removeWidget(board: Dashboard, widgetId: string): Dashboard {
    const targetIdx: number = board.widgets.findIndex(item => item.id === widgetId);

    // remove widget relation
    if ('page' === board.widgets[targetIdx].type) {
      this._removeWidgetRelation(widgetId, board.configuration.relations);
    } else if ('filter' === board.widgets[targetIdx].type) {
      this._removeWidgetRelation(widgetId, board.configuration.filterRelations, board);
    }

    // remove widget
    board.widgets.splice(targetIdx, 1);

    // remove layout config
    const layoutTargetIdx: number = board.configuration.widgets.findIndex(item => item.ref === widgetId);
    board.configuration.widgets.splice(layoutTargetIdx, 1);

    return board;
  } // function - removeWidget

  /**
   * 위젯 연관관계 추가
   * @param {string} widgetId
   * @param {DashboardWidgetRelation[]} items
   * @param {Dashboard} board
   * @protected
   */
  protected _addWidgetRelation(widgetId: string, items: DashboardWidgetRelation[], board?: Dashboard) {
    (items) || (items = []);
    items.push(new DashboardWidgetRelation(widgetId));
    (board) && (this._generateFilterRelationMap(board));
  } // function - _addWidgetRelation

  /**
   * 연관 관계 삭제
   * @param {string} widgetId
   * @param {DashboardWidgetRelation[]} items
   * @param {Dashboard} board
   * @protected
   */
  protected _removeWidgetRelation(widgetId: string, items: DashboardWidgetRelation[], board?: Dashboard) {
    if (items) {
      this._findWidgetRelation(widgetId, items, [],
        (target: DashboardWidgetRelation, _hierarchy: string[], list: DashboardWidgetRelation[]) => {
          const delIdx: number = list.findIndex(item => item.ref === target.ref);
          if (-1 < delIdx) {
            list.splice(delIdx, 1);
          }
          (board) && (this._generateFilterRelationMap(board));
          return true;
        }
      );
    }
  } // function - _removeWidgetRelation

  /**
   * 연관 관계 최하단 여부 판단
   * @param {string} widgetId
   * @param {DashboardWidgetRelation[]} items
   * @param {Dashboard} board
   * @private
   */
  protected _isLeafWidgetRelation(widgetId: string, items: DashboardWidgetRelation[], board?: Dashboard): boolean {
    return this._findWidgetRelation(widgetId, items, [],
      (target: DashboardWidgetRelation) => {
        return !(target.children && 0 < target.children.length);
      },
      board
    );
  } // function - _isLeafWidgetRelation


  /**
   * 부모 위젯 아이디 탐색
   * @param {string} widgetId
   * @param {DashboardWidgetRelation[]} relations
   * @returns {string}
   * @protected
   */
  protected _findParentWidgetId(widgetId: string, relations: DashboardWidgetRelation[]): string {
    let parentId: string = '';

    relations.some(item => {
      if (item.children) {
        if (-1 < item.children.findIndex(child => child.ref === widgetId)) {
          parentId = item.ref;
          return true;
        } else {
          parentId = this._findParentWidgetId(widgetId, item.children);
          return ('' !== parentId);
        }
      } else {
        return false;
      }
    });
    return parentId;
  } // function - _findParentWidgetId

  /**
   * 하위 위젯 목록 조회
   * @param {string} targetId
   * @param {DashboardWidgetRelation[]} items
   * @param {Function} callback
   * @param {Dashboard} board
   * @private
   */
  protected _getAllChildWidgetRelation(targetId: string, items: DashboardWidgetRelation[], callback: HierarchyCallback, board: Dashboard) {

    const getChildItems = (relItems: DashboardWidgetRelation[], children: string[]) => {
      if (relItems && 0 < relItems.length) {
        return relItems.reduce((acc, item) => {
          acc.push(item.ref);
          if (item.children && 0 < item.children.length) {
            acc = getChildItems(item.children, acc);
          }
          return acc;
        }, children);
      } else {
        return children;
      }
    };

    this._findWidgetRelation(targetId, items, [],
      (target: DashboardWidgetRelation, _hierarchy: string[]) => {
        (callback) && (callback(target, getChildItems(target.children, [])));
        return true;
      },
      board
    );
  }

  /**
   * 필터의 관계 Map을 생성한다.
   * @param board
   * @protected
   */
  protected _generateFilterRelationMap(board: Dashboard) {

    const circulateItems = (items: DashboardWidgetRelation[], callback: (target: DashboardWidgetRelation) => void) => {
      if (items) {
        items.forEach(relItem => {
          (callback) && (callback(relItem));
          (relItem.children) && (circulateItems(relItem.children, callback));
        });
      }
    };

    (board.configuration.filterRelMap) || (board.configuration.filterRelMap = {});
    circulateItems(board.configuration.filterRelations, (relItem: DashboardWidgetRelation) => {
      this._findWidgetRelation(relItem.ref, board.configuration.filterRelations, [],
        (target: DashboardWidgetRelation, hierarchy: string[]) => {
          const filterWidget: FilterWidget = DashboardUtil.getWidget(board, target.ref) as FilterWidget;
          if (filterWidget) {
            board.configuration.filterRelMap[target.ref] = {
              widgetId: target.ref,
              relItem: target,
              parents: hierarchy,
              dataSource: filterWidget.configuration.filter.dataSource,
              field: filterWidget.configuration.filter.field,
              type: filterWidget.configuration.filter.type
            };
          }
          return true;
        }
      );
    })
  } // function - _generateFilterRelationMap

  /**
   * 위젯 연관관계 탐색
   * @param {string} targetId
   * @param {DashboardWidgetRelation[]} items
   * @param {string[]} hierarchy
   * @param {Function} callback
   * @param {Dashboard} board
   * @protected
   */
  protected _findWidgetRelation(targetId: string, items: DashboardWidgetRelation[],
                                hierarchy: string[] = [], callback: HierarchyCallback, board?: Dashboard): boolean {
    if (board) {
      const relMapItem = board.configuration.filterRelMap[targetId];
      if (relMapItem) {
        return callback(relMapItem.relItem, relMapItem.parents, items);
      }
    } else {
      return items.some((relItem: DashboardWidgetRelation) => {
        const newHierarchy = [].concat(hierarchy);
        if (targetId === relItem.ref) {
          return callback(relItem, newHierarchy, items);
        } else {
          if (relItem.children) {
            newHierarchy.push(relItem.ref);
            return this._findWidgetRelation(targetId, relItem.children, newHierarchy, callback);
          } else {
            return false;
          }
        }
      });
    }
  } // function - _findWidgetRelation

}

type HierarchyCallback = (target: DashboardWidgetRelation, hierarchy: string[], item?: DashboardWidgetRelation[]) => boolean;
