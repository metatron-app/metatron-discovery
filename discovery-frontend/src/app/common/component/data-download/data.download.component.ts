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

import {AbstractPopupComponent} from '../abstract-popup.component';
import {
  Component,
  ElementRef,
  EventEmitter,
  Injector, Input,
  OnChanges,
  OnDestroy,
  OnInit, Output,
  SimpleChanges
} from '@angular/core';
import {WidgetService} from '../../../dashboard/service/widget.service';
import {saveAs} from 'file-saver';
import {GridComponent} from '../grid/grid.component';
import {CommonUtil} from '../../util/common.util';
import {Alert} from '../../util/alert.util';

@Component({
  selector: 'data-download',
  templateUrl: './data.download.component.html',
  host: {'(document:click)': 'onClickHost($event)'}
})
export class DataDownloadComponent extends AbstractPopupComponent implements OnInit, OnChanges, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 다운로드 대상 아이디
  private _downloadId: string = '';

  // 그리드 컴포넌트
  private _gridComp: GridComponent;

  // 다운로드 데이터
  private _downData: { cols: any[], rows: any[] };

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  // 위젯 데이터 다운로드 모드
  public mode: ('WIDGET' | 'GRID' | 'DATA') = 'WIDGET';

  public isShow: boolean = false;

  public isOriginDown: boolean = true;

  public downloadType: string = 'ALL';
  public downloadRow: number = 0;
  public preview: PreviewResult;

  public commonUtil = CommonUtil;

  @Input()
  public title: string = '';

  @Output('close')
  public closeEvent: EventEmitter<any> = new EventEmitter<any>();

  @Output('startDownload')
  public startDownEvent: EventEmitter<any> = new EventEmitter();

  @Output('endDownload')
  public endDownEvent: EventEmitter<any> = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private widgetService: WidgetService,
              protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 컴포넌트 초기 실행
   */
  public ngOnInit() {
    super.ngOnInit();
  }

  /**
   * Input 값 변경 체크
   * @param {SimpleChanges} changes
   */
  public ngOnChanges(changes: SimpleChanges) {
  }

  /**
   * 컴포넌트 제거
   */
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /**
   * 외부영역 클릭
   * @param {MouseEvent} event
   */
  public onClickHost(event: MouseEvent) {
    // 현재 element 내부에서 생긴 이벤트가 아닌경우 hide 처리
    const $target: any = $(event.target);
    if (this.isShow
      && !$target.hasClass('ddp-icon-widget-gridsave')
      && !$target.hasClass('ddp-box-layout4') && 0 === $target.closest('.ddp-box-layout4').length) {
      this.close();
    }
  } // function - onClickHost

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 위젯 데이터 다운로드 팝업 오픈
   * @param {MouseEvent} event
   * @param {string} widgetId
   * @param {boolean} isOriginDown
   */
  public openWidgetDown(event: MouseEvent, widgetId: string, isOriginDown: boolean = true) {
    this._openComponent(event, 'RIGHT');
    this._downloadId = widgetId;
    this.mode = 'WIDGET';
    this.isOriginDown = isOriginDown;
    this.preview = undefined;

    if (isOriginDown) {
      this.widgetService.previewWidget(widgetId, isOriginDown, true).then(result => {
        if (result) {
          this.preview = new PreviewResult(result.estimatedSize, result.totalCount);
        }
        this.safelyDetectChanges();
      }).catch((err) => {
        this.preview = null;
        this.commonExceptionHandler(err);
      });
    }
  } // function - openWidgetDown

  // noinspection JSUnusedGlobalSymbols
  /**
   * 그리드 컴포넌트 다운로드 팝업 오픈
   * @param {MouseEvent} event
   * @param {GridComponent} gridComp
   * @param {PreviewResult} preview
   */
  public openGridDown(event: MouseEvent, gridComp: GridComponent, preview?:PreviewResult ) {
    this._openComponent(event, 'RIGHT');
    (preview) && (this.preview = preview);
    this.mode = 'GRID';
    this.isOriginDown = true;
    this._gridComp = gridComp;
  } // function - openGridDown

  /**
   * 데이터 다운로드 팝업 오픈
   * @param {MouseEvent} event
   * @param {any[]} cols
   * @param {any[]} rows
   * @param {PreviewResult} preview
   */
  public openDataDown(event: MouseEvent, cols: any[], rows: any[], preview?: PreviewResult) {
    this._openComponent(event, 'RIGHT');
    (preview) && (this.preview = preview);
    this.mode = 'DATA';
    this.isOriginDown = true;
    this._downData = {cols: cols, rows: rows};
  } // function - openDataDown

  /**
   * 컴포넌트 닫기
   */
  public close() {
    this.isShow = false;
    this.closeEvent.emit();
  } // function - close

  /**
   * CSV 데이터 다운로드 실행
   */
  public downloadCSV() {
    this.close();
    if ('WIDGET' === this.mode) {
      this.startDownEvent.emit();
      this.widgetService.downloadWidget(this._downloadId, this.isOriginDown, 1000000, 'CSV').subscribe(
        result => {
          // 파일 저장
          saveAs(result, 'data.csv');
          this.endDownEvent.emit();
        },
        () => {
          Alert.error(this.translateService.instant('msg.comm.alert.save.fail'));
          this.endDownEvent.emit();
        });
    } else if ('GRID' === this.mode) {
      this._gridComp.csvDownload('data');
    } else if ('DATA' === this.mode) {
      this._dataDownload( this._downData.cols, this._downData.rows, 'CSV' );
    }
  } // function - downloadCSV

  /**
   * CSV 데이터 다운로드 실행
   */
  public downloadExcel() {
    this.close();
    if ('WIDGET' === this.mode) {
      this.startDownEvent.emit();
      this.widgetService.downloadWidget(this._downloadId, this.isOriginDown, 1000000, 'EXCEL').subscribe(
        result => {
          // 파일 저장
          saveAs(result, 'data.xlsx');
          this.endDownEvent.emit();
        },
        () => {
          Alert.error(this.translateService.instant('msg.comm.alert.save.fail'));
          this.endDownEvent.emit();
        });
    } else if ('GRID' === this.mode) {
      this._gridComp.excelDownload('data');
    } else if ('DATA' === this.mode) {
      this._dataDownload( this._downData.cols, this._downData.rows, 'EXCEL' );
    }
  } // function - downloadExcel

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 컴포넌트 열기
   * @param {MouseEvent} event
   * @param {string} position
   * @private
   */
  private _openComponent(event: MouseEvent, position: string) {
    this.downloadType = 'ALL';
    this.downloadRow = 0;
    this.isShow = true;
    this.safelyDetectChanges();

    let $target: any = $(event.target);
    ($target.hasClass('ddp-box-btn2')) || ($target = $target.closest('.ddp-box-btn2'));
    const lnbmoreLeft: number = $target.offset().left;
    const lnbmoreTop: number = $target.offset().top;
    switch (position) {
      case 'RIGHT' :
        this.$element.find('.ddp-box-layout4.ddp-download').css({'left': lnbmoreLeft - 340, 'top': lnbmoreTop + 20});
        break;
      case 'CENTER' :
        this.$element.find('.ddp-box-layout4.ddp-download').css({'left': lnbmoreLeft - 170, 'top': lnbmoreTop + 20});
        break;
      case 'LEFT' :
        this.$element.find('.ddp-box-layout4.ddp-download').css({'left': lnbmoreLeft, 'top': lnbmoreTop + 20});
        break;
      default :
    }
  } // function - _openComponent

  /**
   * Data Download
   */
  private _dataDownload(cols: any[], rows: any[], type: ('CSV' | 'EXCEL'), fileName: string = 'data'): void {

    if (cols && rows) {

      let downRows: any[] = [];

      // Header
      const header: any[] = cols.map(col => '"' + col.name + '"');
      downRows.push(header.join(','));

      // Row
      downRows = downRows.concat(
        rows.map(row => {
          const obj: any[] = [];
          cols.forEach(col => {
            obj.push('"' + row[col.name] + '"');
          });
          return obj.join(',');
        })
      );

      if( 'CSV' === type ) {
        saveAs(new Blob(['\ufeff' + downRows.join('\n')], { type: 'application/csv;charset=utf-8' }), fileName + '.csv');
      } else {
        saveAs(new Blob(['\ufeff' + downRows.join('\n')], { type: 'application/vnd.ms-excel;charset=charset=utf-8' }), fileName + '.xls');
      }

    }
  } // function - _dataDownload

}

export class PreviewResult {
  public size: number;
  public count: number;

  constructor(size: number, count: number) {
    this.size = size ? size : 0;
    this.count = count ? count : 0;
  }
}

