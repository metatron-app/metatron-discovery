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

import {Component, ElementRef, Injector, Input, OnDestroy, OnInit,} from '@angular/core';
import {AbstractComponent} from '../../../../common/component/abstract.component';
import {EventBroadcaster} from "../../../../common/event/event.broadcaster";
import {Page} from "../../../../domain/common/page";
import {Alert} from "../../../../common/util/alert.util";
import {HivePersonalDatabaseService} from "../../service/plugins.hive-personal-database.service";

/**
 * Global variable in detail workbench
 */
@Component({
  selector: 'plugin-hive-personal-database-data-aggregate',
  templateUrl: './data-aggregate.component.html',
})
export class DataAggregateComponent extends AbstractComponent implements OnInit, OnDestroy {

  @Input()
  public workbenchId: string;

  public dataAggregateTaskStatusInformations: any[] = [];

  // constructor
  constructor(protected element: ElementRef,
              protected injector: Injector,
              protected broadCaster: EventBroadcaster,
              private hivePersonalDatabaseService: HivePersonalDatabaseService) {
    super(element, injector);
  }

  // Init
  public ngOnInit() {
    super.ngOnInit();
    this.page.size = 20;

    this.loadDataAggregateTasks();

    this.subscriptions.push(
      this.broadCaster.on<any>('COMPLETE_HIVE_PERSONAL_DATABASE_CREATE_DATA_AGGREGATE_TASK').subscribe(() => {
        this.loadDataAggregateTasks(false);
      }),
    );
  }
  // Destory
  public ngOnDestroy() {
    // Destory
    super.ngOnDestroy();
  }

  private loadDataAggregateTasks(appendMode: boolean = true): void {
    this.loadingShow();
    this.hivePersonalDatabaseService.getDataAggregateTasks(this.workbenchId, this.page)
      .then((result) => {
        this.loadingHide();
        this.pageResult.number = result.number;
        this.pageResult.totalElements = result.totalElements;
        this.pageResult.totalPages = result.totalPages;
        this.pageResult.size = result.size;

        if(appendMode) {
          this.dataAggregateTaskStatusInformations = this.dataAggregateTaskStatusInformations.concat(result.content);
        } else {
          this.dataAggregateTaskStatusInformations = result.content;
        }
      })
      .catch((error) => {
        this.commonExceptionHandler(error);
      });
  }

  public onClickShowAddDataAggregate() {
    this.broadCaster.broadcast('SHOW_HIVE_PERSONAL_DATABASE_CREATION_DATA_AGGREGATE_TASK');
  }

  public refreshTasks() {
    this.page.page = 0;
    this.loadDataAggregateTasks(false);
  }

  public goTaskDetails(item: any): void {
    this.broadCaster.broadcast('SHOW_HIVE_PERSONAL_DATABASE_DETAILS_DATA_AGGREGATE_TASK', {
      "id": item.id,
      "name": item.name
    });
  }

  public moreTasks(): void {
    this.page.page = this.page.page + 1;
    this.loadDataAggregateTasks();
  }
}

export class DataAggregate {
  public name: string = "";
  public sourceDatabase: string = "";
  public sourceQuery: string = "";
  public targetDatabase: string = "";
  public targetTable: string = "";
  public targetTableList: string[];
  public rangeFrom: string = "";
  public rangeTo: string = "";
  public rangeFormat: string = "yyyyMMdd";

  public getRangeType() : RangeType {
    const queryCommentRemoved = this.sourceQuery.trim().split("\n").map(line => {
      if(line.startsWith("--")) {
        return "";
      } else {
        return line
      }
    }).join('');

    if( (queryCommentRemoved.indexOf("${date_range}") > -1) && (queryCommentRemoved.indexOf("${hour_range}") > -1)) {
      return RangeType.BOTH;
    } else if(queryCommentRemoved.indexOf("${date_range}") > -1) {
      return RangeType.DATE;
    } else if(queryCommentRemoved.indexOf("${hour_range}") > -1) {
      return RangeType.HOUR;
    } else {
      return RangeType.NA;
    }
  }
}

export enum RangeType {
  DATE = <any>'date',
  HOUR = <any>'hour',
  BOTH = <any>'both',
  NA = <any>'na',
}


