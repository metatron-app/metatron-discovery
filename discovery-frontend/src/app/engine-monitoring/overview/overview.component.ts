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
  public tableSortProperty: string = '';
  public tableSortDirection: Engine.TableSortDirection = this.TABLE_SORT_DIRECTION.NONE;

  public readonly VIEW_MODE = Engine.ViewMode;
  public selectedViewMode: Engine.ViewMode = this.VIEW_MODE.GRID;
  public selectedDuration: string = '1DAY';

  private readonly ICON_NORMAL_CLASS = 'ddp-icon-status-success';
  private readonly ICON_WARN_CLASS = 'ddp-icon-status-warning';
  private readonly ICON_ERROR_CLASS = 'ddp-icon-status-error';
  private readonly ICON_NONE_CLASS = '';

  private readonly TYPE_NORMAL_CLASS = 'type-historical';
  private readonly TYPE_WARN_CLASS = 'type-broker';
  private readonly TYPE_ERROR_CLASS = 'type-coordinator';
  private readonly TYPE_NONE_CLASS = '';

  @ViewChild(NodeInformationComponent)
  private readonly _nodeInformationComponent: NodeInformationComponent;

  @ViewChild(GraphComponent)
  private readonly _graphComponent: GraphComponent;

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
    this._initializeView();

    this.subscriptions.push(
      this.activatedRoute.queryParams
        .subscribe(params => {
          this._initTableSortDirection();
          this._changeKeyword(decodeURIComponent(_.get(params, 'keyword', '')));
          this._changeStatus(_.get(params, 'status', Engine.MonitoringStatus.ALL));
          this._changeDuration(_.get(params, 'duration', '1DAY'));
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
      .then(() => this.engineService.getMonitoringServersHealth().then(result => this.clusterStatus = result))
      .then(() => {
        return this.engineService.getMonitorings(Engine.Monitoring.ofEmpty(), this.pageResult, 'forDetailView')
          .then(result => this.monitorings = result._embedded.monitorings)
      })
      .then(() => this.engineService.getSize().then(result => this.clusterSize = result))
      .then(() => {
        this._graphComponent.onResize(event);
        this.loadingHide();
      })
      .catch(error => {
        this.clusterStatus = new Engine.Cluster.Status();
        this.monitorings = [];
        this.commonExceptionHandler(error);
      });
  }

  /**
   * Pagenation processing is not available on this screen
   * create a Pageable parameter for importing a complete list
   */
  private _createPageableParameter() {
    this.pageResult.number = 0;
    this.pageResult.size = 5000;
  }

  /**
   * Cllck hostname column
   */
  public clickHostameHeaderColumn(column: string) {

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
    switch (type) {
      case Engine.NodeType.BROKER:
        return this._toCamelCase(type);
      case Engine.NodeType.COORDINATOR:
        return this._toCamelCase(type);
      case Engine.NodeType.HISTORICAL:
        return this._toCamelCase(type);
      case Engine.NodeType.OVERLORD:
        return this._toCamelCase(type);
      case Engine.NodeType.MIDDLE_MANAGER:
        return this._toCamelCase(type);
      default:
        return type;
    }
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

  /**
   * Utility function to change only the first letter to uppercase
   */
  private _toCamelCase(type: Engine.NodeType) {

    if (_.isNil(type)) {
      return '';
    }

    if (type.length === 0) {
      return type;
    }

    return `${type.charAt(0).toLocaleUpperCase()}${type.substring(1, type.length)}`;
  }

  public searchByHostnameColumn(keyword: string) {
    this.router.navigate([
        this.ENGINE_MONITORING_OVERVIEW_ROUTER_URL
      ],
      {
        queryParams: {
          keyword: encodeURIComponent(keyword),
          status: this.selectedMonitoringStatus,
          duration: this.selectedDuration
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
          duration: this.selectedDuration
        }
      })
  }

  public searchByDuration(duration: string) {
    if (duration === this.selectedDuration) {
      this._changeDuration(this.selectedDuration);
    } else {
      this.router.navigate([
          this.ENGINE_MONITORING_OVERVIEW_ROUTER_URL
        ],
        {
          queryParams: {
            keyword: encodeURIComponent(this.keyword),
            status: this.selectedMonitoringStatus,
            duration: duration
          }
        })
    }
  }

  public changeViewMode(viewMode: Engine.ViewMode) {

    if (_.isNil(viewMode)) {
      return;
    }

    if (this.selectedViewMode === viewMode) {
      return;
    }

    this.selectedViewMode = viewMode;
  }

  private _changeTab(contentType: Engine.ContentType) {
    this.router.navigate([ `${Engine.Constant.ROUTE_PREFIX}${contentType}` ]);
  }

  private _changeKeyword(keyword: string) {
    this.keyword = keyword;
  }

  private _changeStatus(status: Engine.MonitoringStatus) {
    this.selectedMonitoringStatus = status;
  }

  private _changeDuration(duration: string) {
    this.selectedDuration = duration;
    this._graphComponent.setDate(duration);
  }

  private _initTableSortDirection() {
    this.tableSortDirection = this.TABLE_SORT_DIRECTION.NONE;
  }

}
