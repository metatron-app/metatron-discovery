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
  AfterViewInit,
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {AbstractComponent} from '../../common/component/abstract.component';
import {EngineService} from '../service/engine.service';
import {Engine} from '../../domain/engine-monitoring/engine';
import * as _ from 'lodash';
import {ActivatedRoute} from '@angular/router';
import {StateService} from '../service/state.service';
import {filter} from 'rxjs/operators';
import {NodeInformationComponent} from "./component/node-information.component";
import {GraphComponent} from "./component/graph.component";
import {NodeTooltipComponent} from "./component/node-tooltip.component";
import {KpiPopupComponent} from "./component/kpi-popup.component";
import {EngineMonitoringUtil} from "../util/engine-monitoring.util";

@Component({
  selector: '[overview]',
  templateUrl: './overview.component.html',
  host: { '[class.ddp-wrap-contents-det]': 'true' }
})
export class OverviewComponent extends AbstractComponent implements OnInit, OnDestroy, AfterViewInit {

  private readonly ENGINE_MONITORING_OVERVIEW_ROUTER_URL = `${Engine.Constant.ROUTE_PREFIX}${Engine.ContentType.OVERVIEW}`;

  public readonly TABLE_SORT_DIRECTION = Engine.TableSortDirection;

  public clusterStatus = new Engine.Cluster.Status();
  public monitorings: Engine.Monitoring[] = [];
  public clusterSize: any;

  public keyword: string = '';
  public selectedMonitoringStatus: Engine.MonitoringStatus = Engine.MonitoringStatus.ALL;
  public selectedNodeType: Engine.NodeType[] = [Engine.NodeType.ALL];
  public tableSortProperty: string = '';
  public tableSortDirection: Engine.TableSortDirection = this.TABLE_SORT_DIRECTION.NONE;
  public duration: string;

  public readonly MONITORING_NODETYPE = Engine.NodeType;
  public readonly VIEW_MODE = Engine.ViewMode;
  public selectedViewMode: Engine.ViewMode = this.VIEW_MODE.GRID;

  private readonly ICON_NORMAL_CLASS = 'ddp-icon-status-success';
  private readonly ICON_WARN_CLASS = 'ddp-icon-status-warning';
  private readonly ICON_ERROR_CLASS = 'ddp-icon-status-error';
  private readonly ICON_NONE_CLASS = '';

  private readonly TYPE_NORMAL_CLASS = 'type-normal'
  private readonly TYPE_WARN_CLASS = 'type-warning';
  private readonly TYPE_ERROR_CLASS = 'type-error';
  private readonly TYPE_NONE_CLASS = '';

  @ViewChild(NodeInformationComponent)
  private readonly _nodeInformationComponent: NodeInformationComponent;

  @ViewChild(GraphComponent)
  private readonly _graphComponent: GraphComponent;

  @ViewChild(NodeTooltipComponent)
  private readonly _nodeTooltipComponent: NodeTooltipComponent;

  @ViewChild(KpiPopupComponent)
  private readonly _kpiPopupComponent: KpiPopupComponent;

  constructor(protected elementRef: ElementRef,
              protected injector: Injector,
              private activatedRoute: ActivatedRoute,
              private engineService: EngineService,
              private stateService: StateService) {
    super(elementRef, injector);
  }

  public ngOnInit() {

    super.ngOnInit();
    this._createPageableParameter();

    this.subscriptions.push(
      this.activatedRoute.queryParams
        .subscribe(params => {
          this._initTableSortDirection();
          this._changeKeyword(decodeURIComponent(_.get(params, 'keyword', '')));
          this._changeStatus(_.get(params, 'status', Engine.MonitoringStatus.ALL));
        }));

    this.subscriptions.push(
      this.stateService.changeTab$
        .pipe(filter(({ current }) => current.isOverview()))
        .subscribe(({ next }) => this._changeTab(next))
    );
  }

  public ngAfterViewInit() {
    super.ngAfterViewInit();
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  private _initializeView() {
    Promise.resolve()
      .then(() => this.loadingShow())
      .then(() => this.engineService.getMonitorings(Engine.Monitoring.ofEmpty(), this.pageResult, 'forDetailView')
          .then(result => this.monitorings = result._embedded.monitorings)
      )
      .then(() => this.engineService.getMonitoringServersHealth().then(result => this.clusterStatus = result))
      .then(() => this.engineService.getSize().then(result => this.clusterSize = result))
      .then(() => {
        this._graphComponent.onResize(event);
        this.loadingHide();
      })
      .catch(error => {
        this.commonExceptionHandler(error);
      });
  }

  public sortTable(column: string) {

    if (this.tableSortProperty == column) {
      this.tableSortDirection = this.tableSortDirection == this.TABLE_SORT_DIRECTION.DESC
        ? this.TABLE_SORT_DIRECTION.ASC
        : this.TABLE_SORT_DIRECTION.DESC;
    } else {
      this.tableSortDirection = this.TABLE_SORT_DIRECTION.DESC;
    }

    this.tableSortProperty = column;
  }

  /**
   * Create labels with five node types.
   *  - broker, coordinator, historical, overlord, middleManager
   */
  public convertTypeLabel(type: Engine.NodeType) {
    return EngineMonitoringUtil.convertTypeLabel(type);
  }

  public getTypeStatusClass(clusterStatus: Engine.Cluster.Code) {
    switch (clusterStatus) {
      case Engine.Cluster.Code.NORMAL:
        return this.TYPE_NORMAL_CLASS;
      case Engine.Cluster.Code.WARN:
        return this.TYPE_WARN_CLASS;
      case Engine.Cluster.Code.ERROR:
        return this.TYPE_ERROR_CLASS;
      default:
        return this.TYPE_NONE_CLASS;
    }
  }

  public getIconStatusClass(clusterStatus: Engine.Cluster.Code) {
    switch (clusterStatus) {
      case Engine.Cluster.Code.NORMAL:
        return this.ICON_NORMAL_CLASS;
      case Engine.Cluster.Code.WARN:
        return this.ICON_WARN_CLASS;
      case Engine.Cluster.Code.ERROR:
        return this.ICON_ERROR_CLASS;
      default:
        return this.ICON_NONE_CLASS;
    }
  }

  public showNodeInformationModal(monitoring: Engine.Monitoring) {
    this._nodeInformationComponent.show(monitoring);
  }

  public showKpiChart(monitoringTarget:Engine.MonitoringTarget) {
    this._kpiPopupComponent.show(monitoringTarget, this.duration);
  }

  public searchByHostnameColumn(keyword: string) {
    this.router.navigate([
        this.ENGINE_MONITORING_OVERVIEW_ROUTER_URL
      ],
      {
        queryParams: {
          keyword: encodeURIComponent(keyword),
          status: this.selectedMonitoringStatus,
          type: this.selectedNodeType
        }
      })
  }

  public searchByStatusColumn(status: Engine.MonitoringStatus) {
    this.router.navigate([
        this.ENGINE_MONITORING_OVERVIEW_ROUTER_URL
      ],
      {
        queryParams: {
          keyword: encodeURIComponent(this.keyword),
          status: status,
          type: this.selectedNodeType
        }
      })
  }

  public searchByNodeType(nodeType: Engine.NodeType) {
    if (nodeType === Engine.NodeType.ALL) {
      this.selectedNodeType = [Engine.NodeType.ALL];
    } else {
      if (this.selectedNodeType.indexOf(Engine.NodeType.ALL) > -1) {
        this.selectedNodeType = [];
      }
      const nodeTypes = _.cloneDeep(this.selectedNodeType);
      if (this.selectedNodeType.indexOf(nodeType) > -1) {
        nodeTypes.splice(this.selectedNodeType.indexOf(nodeType), 1);
      } else {
        nodeTypes.push(nodeType);
      }
      this.selectedNodeType = nodeTypes;
    }

    if (this.selectedNodeType.length == 0) {
      this.selectedNodeType = [Engine.NodeType.ALL];
    }

    setTimeout(() => {
      this._graphComponent.onResize(event);
    }, 300);
  }

  public changeDuration(duration: string) {
    this.duration = duration;
    this._initializeView();
    this._graphComponent.setDate(duration);
  }

  public changeViewMode(viewMode: Engine.ViewMode) {
    if (_.isNil(viewMode)) {
      return;
    }
    if (this.selectedViewMode === viewMode) {
      return;
    }
    this.selectedViewMode = viewMode;

    setTimeout(() => {
      this._graphComponent.onResize(event);
    }, 300);

  }

  public showNodeInformationTooltip(monitoring: Engine.Monitoring, event: MouseEvent) {
    const target = $(event.target);
    let targetLeft: number = target.position().left + 18;
    let targetTop: number = target.position().top + 26;
    this._nodeTooltipComponent.setEngineMonitoring(monitoring, targetLeft, targetTop);
  }

  public hideNodeInformationTooltip(event: MouseEvent) {
    if (!$(event.relatedTarget).hasClass('ddp-wrap-tooltip')) {
      this._nodeTooltipComponent.isShow = false;
    }
  }

  private _changeTab(contentType: Engine.ContentType) {
    this.router.navigate([ `${Engine.Constant.ROUTE_PREFIX}${contentType}` ]);
  }

  private _changeKeyword(keyword: string) {
    this.keyword = keyword;

    setTimeout(() => {
      this._graphComponent.onResize(event);
    }, 300);
  }

  private _changeStatus(status: Engine.MonitoringStatus) {
    this.selectedMonitoringStatus = status;

    setTimeout(() => {
      this._graphComponent.onResize(event);
    }, 300);
  }

  private _initTableSortDirection() {
    this.tableSortDirection = this.TABLE_SORT_DIRECTION.NONE;
  }

  /**
   * Pagenation processing is not available on this screen
   * create a Pageable parameter for importing a complete list
   */
  private _createPageableParameter() {
    this.pageResult.number = 0;
    this.pageResult.size = 5000;
  }

}
