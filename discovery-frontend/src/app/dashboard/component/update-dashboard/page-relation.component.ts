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

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2
} from '@angular/core';
import {AbstractComponent} from '@common/component/abstract.component';
import {FunctionValidator} from '@common/component/chart/option/define/common';

import {Widget} from '@domain/dashboard/widget/widget';
import {Field} from '@domain/datasource/datasource';
import {DashboardWidgetRelation} from '@domain/dashboard/dashboard';
import {PageWidgetConfiguration} from '@domain/dashboard/widget/page-widget';
import {FilterWidgetConfiguration} from '@domain/dashboard/widget/filter-widget';

import {DashboardUtil} from '../../util/dashboard.util';

declare let $;

@Component({
  selector: 'app-page-relation',
  templateUrl: './page-relation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageRelationComponent extends AbstractComponent implements OnInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 차트 기능 확인기
  private _chartFuncValidator: FunctionValidator = new FunctionValidator();

  // 트리 객체
  private _$tree;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  // 표시여부
  public isShow: boolean = false;

  public title: string;

  public description: string;

  @Output()
  public changeRelation: EventEmitter<{ relations: DashboardWidgetRelation[], type: string }> = new EventEmitter();

  @Input()
  public hierarchyType: string;

  public summary: { value: number, label: string } = {value: 0, label: ''};

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected element: ElementRef,
              protected injector: Injector,
              protected renderer: Renderer2) {
    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 클래스 초기화
   */
  public ngOnInit() {
    super.ngOnInit();
  } // function - ngOnInit

  /**
   * 클래스 제거
   */
  public ngOnDestroy() {
    super.ngOnDestroy();
  } // function - ngOnDestroy

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public get getNumberOfTree() {
    const list = [];
    for (let i = 0; i < this.summary.value; i++) {
      list.push(i);
    }
    return list;
  }

  /**
   * 컴포넌트 실행함수
   */
  public run(initialData: { nodes: DashboardWidgetRelation[], widgets: Widget[], title?: string, description?: string }) {

    this.loadingShow();

    // number of widgets
    this.summary.label = 'widgets';
    this.summary.value = initialData.widgets.length || 0;

    // set title and description
    if (this.hierarchyType === 'filter') {
      this.title = initialData.title;
      this.description = initialData.description;
    } else {
      this.title = this.translateService.instant('msg.board.hierarchy.title');
      this.description = this.translateService.instant('msg.board.hierarchy.desc');
    }

    // open popup
    this.isShow = true;

    // if node is empty, return
    if (!initialData.nodes) {
      this.loadingHide();
      this.close();
      return;
    }

    // make draggable tree sturcture
    const data = this._getTreeData(initialData.nodes, initialData.widgets, this.hierarchyType);
    this.safelyDetectChanges();
    setTimeout(() => {
      this._$tree = $('.ddp-wrap-order-setting');
      this._$tree.tree({
        data: data,
        autoOpen: true,
        dragAndDrop: true,
        onCanMove: (node) => {
          return (this.hierarchyType !== 'filter' || 'include' === node.type);
        },
        onCanMoveTo: (movedNode, targetNode, position) => {
          $('.ddp-drag-enable').removeClass('ddp-drag-enable');
          $('.ddp-drag-disable').removeClass('ddp-drag-disable');
          if ('inside' === position && targetNode.type) {
            if (movedNode.dataSource === targetNode.dataSource &&
              (
                this._chartFuncValidator.checkUseSelectionByTypeString(targetNode.type) ||
                (this.hierarchyType === 'filter' && 'include' === targetNode.type)
              )
            ) {
              // set max depth
              const maxDepth: number = this.hierarchyType === 'filter' ? 8 : 2;
              if (this._getNodeDepth(targetNode) > maxDepth) {
                $(targetNode.element).addClass('ddp-drag-disable');
                return false
              }
              $(targetNode.element).addClass('ddp-drag-enable');
              return true;
            } else {
              $(targetNode.element).addClass('ddp-drag-disable');
              return false;
            }
          } else {
            return true;
          }
        },
        onDragStop: () => {
          $('li.jqtree-element').removeClass('ddp-drag-enable').removeClass('ddp-drag-disable');
        },
        onCreateLi: (node, $li) => {
          let html = `<div class="jqtree-title jqtree_common node-content-wrapper" role="treeitem" aria-selected="false" aria-expanded="false">
           <em class="ddp-node-depth" ></em>`;
          if (this.hierarchyType === 'filter') {
            html += '<em class="ddp-box-type type-' + node.dimensionMeasure + '"><em class="' + node.cssClass + ' type-absolute"></em></em>'
          } else {
            html += '<em class="ddp-img-chart-' + node.type + '"></em>'
          }
          html += `<span>${node.name}</span></div>`;

          $li.find('.jqtree-element').html(html);
        }
      });
      this.loadingHide();
    }, 500);
  } // function - run

  /**
   * 컴포넌트 종료함수
   */
  public close() {
    this.isShow = false;
    this.safelyDetectChanges();
  } // function - close

  /**
   * 페이지 연관관계를 저장함
   */
  public savePageRelation() {
    const treeNodes = JSON.parse(this._$tree.tree('toJson'));
    const rels: DashboardWidgetRelation[] = treeNodes.map(node => this._toBoardPageRelation(node));
    this.changeRelation.emit({relations: rels, type: this.hierarchyType});
    this.close();
  } // function - savePageRelation

  /**
   * 트리 마우스 다운 이벤트
   * @param {MouseEvent} event
   */
  public treeMouseDown(event: MouseEvent) {
    const $target = $(event.target);
    if ($target.hasClass('node-content-wrapper')) {
      $target.addClass('ddp-tree-drag-start');
    } else if (0 < $target.closest('.node-content-wrapper').length) {
      $target.closest('.node-content-wrapper').addClass('ddp-tree-drag-start');
    }
  } // function - treeMouseDown

  /**
   * 트리 마우스 업 이벤트
   * @param {MouseEvent} _event
   */
  public treeMouseUp(_event: MouseEvent) {
    this._$tree.find('.ddp-tree-drag-start').removeClass('ddp-tree-drag-start');
  } // function - treeMouseUp

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 노드 데이터를 Dashboard Page Relation 객체로 변환
   * @param nodeData
   * @returns {DashboardWidgetRelation}
   * @private
   */
  private _toBoardPageRelation(nodeData) {
    const pageRel = new DashboardWidgetRelation(nodeData.id);
    if (nodeData.children && 0 < nodeData.children.length) {
      pageRel.children = nodeData.children.map(item => this._toBoardPageRelation(item));
    }
    return pageRel;
  } // function - _toBoardPageRelation

  /**
   * Node의 Depth 를 얻는다.
   * @param node
   * @returns {number}
   * @private
   */
  private _getNodeDepth(node): number {
    return (node.parent) ? 1 + this._getNodeDepth(node.parent) : 0;
  } // function - _getNodeDepth

  /**
   * Tree Data를 위한 데이터 변환
   * @param {DashboardWidgetRelation[]} nodes
   * @param {Widget[]} widgets
   * @param type
   * @returns {any}
   * @private
   */
  private _getTreeData(nodes: DashboardWidgetRelation[], widgets: Widget[], type: string) {

    const nodeList: any = [];
    nodes.some((item) => {
      const widgetInfo = widgets.find(widget => widget.id === item.ref);

      if (!widgetInfo) {
        return false;
      }

      const nodeData: any = {
        id: item.ref,
        label: widgetInfo.name
      };
      if (type === 'filter') {
        const conf: FilterWidgetConfiguration = widgetInfo.configuration as FilterWidgetConfiguration;
        // find field
        const field = DashboardUtil.getFieldByName(widgetInfo.dashBoard, conf.filter.dataSource, conf.filter.field);

        // find css class
        const cssClass = Field.getDimensionTypeIconClass(field);

        // find if its dimension or measure
        let dimensionMeasure = field.role.toString().toLowerCase();
        if (dimensionMeasure === 'timestamp') {
          dimensionMeasure = 'dimension'
        }

        nodeData.dataSource = conf.filter.dataSource;
        nodeData.type = conf.filter.type;
        nodeData['cssClass'] = cssClass;
        nodeData['dimensionMeasure'] = dimensionMeasure;

      } else {
        const conf: PageWidgetConfiguration = widgetInfo.configuration as PageWidgetConfiguration;
        nodeData.dataSource = ('multi' === conf.dataSource.type) ? '' : conf.dataSource.name;
        nodeData.type = conf.chart.type;
      }

      if (item.children && 0 < item.children.length) {
        nodeData.children = this._getTreeData(item.children, widgets, type);
      }
      nodeList.push(nodeData);
    });
    return nodeList;
  } // function - _getTreeData

  // /**
  //  * 전체 노드 갯수를 반환함
  //  * @param {DashboardWidgetRelation[]} nodes
  //  * @return {number}
  //  * @private
  //  */
  // private _getCntNodes(nodes: DashboardWidgetRelation[]) {
  //   let cntNodes: number = 0;
  //   nodes.forEach(item => {
  //     cntNodes++;
  //     if (item.children && 0 < item.children.length) {
  //       cntNodes += this._getCntNodes(item.children);
  //     }
  //   });
  //   return cntNodes;
  // } // function - _getCntNodes

}
