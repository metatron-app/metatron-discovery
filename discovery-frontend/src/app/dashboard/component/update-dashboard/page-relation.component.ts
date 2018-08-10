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

import { AbstractComponent } from '../../../common/component/abstract.component';
import {
  Component, ElementRef, Injector, OnDestroy, OnInit, Output, EventEmitter
} from '@angular/core';
import * as _ from 'lodash';
import { FunctionValidator } from '../../../common/component/chart/option/define/common';
import { DashboardPageRelation, DashboardWidgetRelation } from '../../../domain/dashboard/widget/page-widget.relation';
import { Widget } from '../../../domain/dashboard/widget/widget';

declare let $;

@Component({
  selector: 'app-page-relation',
  templateUrl: './page-relation.component.html'
})
export class PageRelationComponent extends AbstractComponent implements OnInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 차트 기능 확인기
  private _chartFuncValidator: FunctionValidator = new FunctionValidator();

  // 위젯 목록
  private _widgets:Widget[] = [];

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

  // 트리 정보
  public nodes: DashboardWidgetRelation[] = [];

  // 위젯 갯수
  public cntWidgets: number = 0;

  @Output()
  public changeRelation: EventEmitter<DashboardWidgetRelation[]> = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected element: ElementRef,
              protected injector: Injector) {
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
  /**
   * 컴포넌트 실행함수
   */
  public run(nodes: DashboardWidgetRelation[], widgets:Widget[]) {
    this.loadingShow();
    this.isShow = true;
    this._widgets = widgets;  // 전체 위젯 목록 저장
    this.nodes = _.cloneDeep(nodes);
    this.cntWidgets = this._getCntNodes(nodes);
    let data = this._getTreeData(nodes);
    this.safelyDetectChanges();
    setTimeout(() => {
      this._$tree = $('.sys-tree-container');
      this._$tree.tree({
        data: data,
        autoOpen: true,
        dragAndDrop: true,
        onCanMoveTo: (moved_node, target_node, position) => {
          $('.ddp-drag-enable').removeClass('ddp-drag-enable');
          $('.ddp-drag-disable').removeClass('ddp-drag-disable');
          if ('inside' === position && target_node.widgetData.chartType) {
            if (this._chartFuncValidator.checkUseSelectionByTypeString(target_node.widgetData.chartType)) {
              $(target_node.element).addClass('ddp-drag-enable');
              return true;
            } else {
              $(target_node.element).addClass('ddp-drag-disable');
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
          $li.find('.jqtree-element').html(
            '<div class="jqtree-title jqtree_common node-content-wrapper" role="treeitem" aria-selected="false" aria-expanded="false">' +
              '<em class="ddp-data-num" style="left:' + (-12 * this._getNodeDepth(node.parent)) + 'px;" >' +
                ($('.node-content-wrapper').length + 1) +
              '</em>' +
              '<em class="ddp-node-depth" ></em>' +
              '<em class="ddp-img-chart-' + node.widgetData.chartType + '"></em>' +
              '<span>' + node.name + '</span>' +
            '</div>'
          );
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
  } // function - close

  /**
   * 페이지 연관관계를 저장함
   */
  public savePageRelation() {
    const treeNodes = JSON.parse( this._$tree.tree('toJson') );
    const rels:DashboardPageRelation[] = treeNodes.map( node => this._toBoardPageRelation( node ) );
    const pageWidgetRels: DashboardWidgetRelation[] = rels.map(rel => new DashboardWidgetRelation(rel, this._widgets));
    this.changeRelation.emit(pageWidgetRels);
    this.close();
  } // function - savePageRelation

  /**
   * 트리 마우스 다운 이벤트
   * @param {MouseEvent} event
   */
  public treeMouseDown(event:MouseEvent) {
    const $target = $( event.target );
    if( $target.hasClass( 'node-content-wrapper' ) ) {
      $target.addClass( 'ddp-tree-drag-start' );
    } else if( 0 < $target.closest( '.node-content-wrapper' ).length ) {
      $target.closest( '.node-content-wrapper' ).addClass( 'ddp-tree-drag-start' );
    }
  } // function - treeMouseDown

  /**
   * 트리 마우스 업 이벤트
   * @param {MouseEvent} event
   */
  public treeMouseUp(event:MouseEvent) {
    this._$tree.find( '.ddp-tree-drag-start' ).removeClass( 'ddp-tree-drag-start' );
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
   * @returns {DashboardPageRelation}
   * @private
   */
  private _toBoardPageRelation( nodeData ) {
    const pageRel = new DashboardPageRelation();
    pageRel.ref = nodeData.id;
    if (nodeData.children && 0 < nodeData.children.length) {
      pageRel.children = nodeData.children.map(item => this._toBoardPageRelation( item ) );
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
   * @returns {any}
   * @private
   */
  private _getTreeData(nodes: DashboardWidgetRelation[]) {
    let nodeList: any = [];
    nodes.forEach(item => {
      const widgetData:any = _.cloneDeep( item );
      delete widgetData['children'];
      delete widgetData['_widgets'];
      let nodeData: any = { id: item.id, label: item.name, widgetData: widgetData };
      if (item.children && 0 < item.children.length) {
        nodeData.children = this._getTreeData(item.children);
      }
      nodeList.push(nodeData);
    });
    return nodeList;
  } // function - _getTreeData

  /**
   * 전체 노드 갯수를 반환함
   * @param {DashboardWidgetRelation[]} nodes
   * @return {number}
   * @private
   */
  private _getCntNodes(nodes: DashboardWidgetRelation[]) {
    let cntNodes: number = 0;
    nodes.forEach(item => {
      cntNodes++;
      if (item.children && 0 < item.children.length) {
        cntNodes += this._getCntNodes(item.children);
      }
    });
    return cntNodes;
  } // function - _getCntNodes

}
