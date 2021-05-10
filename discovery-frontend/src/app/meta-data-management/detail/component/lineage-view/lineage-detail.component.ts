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

import Split from 'split.js'
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {AbstractComponent} from '@common/component/abstract.component';
import {LineageViewService} from '../../service/lineage-view.service';
import {MetadataService} from '../../../metadata/service/metadata.service';
import {MetadataModelService} from '../../../metadata/service/metadata.model.service';
import {Metadata, SourceType} from '@domain/meta-data-management/metadata';
import {GridComponent} from '@common/component/grid/grid.component';
import {GridOption} from '@common/component/grid/grid.option';
import {Header, SlickGridHeader} from '@common/component/grid/grid.header';

@Component({
  selector: 'app-metadata-detail-lineagedetail',
  templateUrl: './lineage-detail.component.html'
})
export class LineageDetailComponent extends AbstractComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private _split: any;

  @ViewChild('previewGrid')
  private gridComponent: GridComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public emptyGrid: boolean = false;

  public mainMetadataId: string = null;

  @Input()
  public selectedNode: any;

  public selectedNodeMetadata: Metadata;

  @Output()
  public resizeEventHandler = new EventEmitter();

  @Output()
  public closeColumnView = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(
    protected element: ElementRef,
    protected lineageViewService: LineageViewService,
    protected metadataService: MetadataService,
    public metaDataModelService: MetadataModelService,
    protected injector: Injector) {
    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    // Init
    super.ngOnInit();

    this.mainMetadataId = this.metaDataModelService.getMetadata().id;

    this.emptyGrid = false;

    this.getMetadata(this.selectedNode.metadataId);
  }

  public ngAfterViewInit() {
    setTimeout(() => {
      this._split = Split(['.sys-lineage-left-panel', '.sys-lineage-right-panel'], {
        sizes: [80, 20], minSize: [300, 300], onDragEnd: (() => {
          this.resizeEventHandler.emit('resize');
        })
      });
      this.resizeEventHandler.emit('resize');
    }, 500);
  } // function -  ngAfterViewInit

  // Destory
  public ngOnDestroy() {
    // Destory
    super.ngOnDestroy();

    if (this._split) {
      this._split.destroy();
      this._split = undefined;
    }
  }

  public ngOnChanges(changedInput: any) {
    if (changedInput.selectedNode) {
      this.getMetadata(changedInput.selectedNode.currentValue.metadataId);
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  get sourceType(): string {
    if (this.selectedNodeMetadata) {
      switch (this.selectedNodeMetadata.sourceType) {
        case SourceType.ENGINE:
          return this.translateService.instant('msg.comm.th.ds');
        case SourceType.JDBC:
          return this.translateService.instant('msg.storage.li.db');
        case SourceType.STAGEDB:
          return this.translateService.instant('msg.storage.li.hive');
        case SourceType.ETC:
          return this.translateService.instant('msg.storage.li.etc');
      }
    }
    return '';
  }

  public getMetadata(metadataId: string) {
    this.metadataService.getDetailMetaData(metadataId).then((result) => {
      this.selectedNodeMetadata = result;
    });

    const limit: number = 32;
    this.metadataService.getMetadataSampleData(metadataId, limit).then((result) => {
      this.updateGrid(result.data);
    });
  }

  private updateGrid(data: any) {
    if (this.gridComponent === undefined || this.gridComponent === null) {
      return;
    }

    // 헤더정보 생성
    const headers: Header[] = data.columnDescriptions.map((column: any) => {
      return new SlickGridHeader()
        .Id(column.name)
        .Name('<span style="padding-left:20px;"><em class="' + column.type + '"></em>' + column.name + '</span>')
        .Field(column.name)
        .Behavior('select')
        .Selectable(false)
        .CssClass('cell-selection')
        .Resizable(true)
        .Unselectable(true)
        .Sortable(false)
        .Formatter(((_scope) => {
          return (_row, _cell, value) => {
            return value;
          };
        })(this))
        .build();
    });

    const rows: any[] = data.rows.map((values: any, index: number) => {
      const row: any = {};
      values.values.map((val: any, idx: number) => {
        row[data.columnNames[idx]] = val;
      });
      row.id = index;
      return row;
    });

    this.gridComponent.create(headers, rows, new GridOption()
      .SyncColumnCellResize(true)
      .NullCellStyleActivate(true)
      .EnableColumnReorder(false)
      .build()
    );
  }

  public gotoLineage() {
    if (this.selectedNode !== null) {
      const metadataId = this.selectedNode.metadataId;

      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      this.router.navigate(['management/metadata/metadata', metadataId, {tab: 'lineageView'}]);
    }
  }

  public closeInfo() {
    this.closeColumnView.emit();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}

