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

import { isNull, isNullOrUndefined, isUndefined } from 'util';
import * as $ from 'jquery';
import {
  AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Injector, Input, OnDestroy, OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { Dataflow } from '../../../../../domain/data-preparation/dataflow';
import { Dataset, Field, Rule } from '../../../../../domain/data-preparation/dataset';
import { StringUtil } from '../../../../../common/util/string.util';
import { Alert } from '../../../../../common/util/alert.util';
import { PreparationAlert } from '../../../../util/preparation-alert.util';
import { AbstractPopupComponent } from '../../../../../common/component/abstract-popup.component';
import { PopupService } from '../../../../../common/service/popup.service';
import { DataflowService } from '../../../service/dataflow.service';
import { SubscribeArg } from '../../../../../common/domain/subscribe-arg';
import * as _ from 'lodash';
import { MulticolumnRenameComponent } from './multicolumn-rename.component';
import { ExtendInputFormulaComponent } from './extend-input-formula.component';
import { EditRuleGridComponent } from './edit-rule-grid/edit-rule-grid.component';
import { EditRuleComponent } from './edit-rule/edit-rule.component';
import { CreateSnapshotPopup } from '../../../../component/create-snapshot-popup.component';
import { RuleListComponent } from './rule-list.component';
import { DataSnapshotDetailComponent } from '../../../../data-snapshot/data-snapshot-detail.component';
import { PreparationCommonUtil } from '../../../../util/preparation-common.util';
import { EventBroadcaster } from '../../../../../common/event/event.broadcaster';

@Component({
  selector: 'app-edit-dataflow-rule-2',
  templateUrl: './edit-dataflow-rule-2.component.html',
  styles: ['.ddp-type-selectbox ul.ddp-list-selectbox li a:hover {background:none}']
})
export class EditDataflowRule2Component extends AbstractPopupComponent implements OnInit, OnDestroy, AfterViewInit {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild(EditRuleGridComponent)
  private _editRuleGridComp: EditRuleGridComponent;

  @ViewChild(MulticolumnRenameComponent)
  private multicolumnRenameComponent: MulticolumnRenameComponent;

  @ViewChild(ExtendInputFormulaComponent)
  private extendInputFormulaComponent: ExtendInputFormulaComponent;

  @ViewChild(CreateSnapshotPopup)
  private createSnapshotPopup: CreateSnapshotPopup;

  @ViewChild('editRule')
  private _editRuleComp: EditRuleComponent;

  @ViewChild(RuleListComponent)
  private ruleListComponent : RuleListComponent;

  @ViewChild(DataSnapshotDetailComponent)
  private dataSnapshotDetailComponent : DataSnapshotDetailComponent;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public isInitDataLoaded: boolean = false;

  @Input()
  public dataflow: Dataflow;

  @Input()
  public selectedDataSet: Dataset;

  @Output()
  public closeEditRule = new EventEmitter();

  @Output()
  public changeDataset = new EventEmitter<Dataset>();

  @Input()
  public step: string;

  // 검색어
  public commandSearchText: string = ''; // command 검색어
  public columnSearchText: string = '';
  public typeSearchText: string = '';
  public unnestSearchText: string = '';
  public moveSearchText: string = '';

  // 조인 편집시 필요한 데이터
  public rightDataset: Dataset;

  // Layer show/hide
  public isColumnListShow: boolean = false;
  public isBeforeOrAfterColumnListShow: boolean = false;
  public isNestListShow: boolean = false;
  // public isRuleListOptionShow: boolean = false;
  public isTypeListShow: boolean = false;
  public isBeforeOrAfterShow: boolean = false;
  public isMultiColumnListShow: boolean = false;
  public isMultiColumnGroupListShow: boolean = false;
  public isRuleJoinModalShow: boolean = false;
  public isRuleUnionModalShow: boolean = false;
  public isOtherDatasetListShow: boolean = false;
  public isCommandListShow: boolean = false;

  // Rules
  public ruleVO: Rule = new Rule();
  public ruleList: any[] = [];
  public isJumped: boolean = false;
  public currentIndex: number = 0;
  public redoable: boolean = false;
  public undoable: boolean = false;

  // Flag for undo and redo, to stop users from multiple requests
  public isRedoRunning: boolean = false;
  public isUndoRunning: boolean = false;

  // Add rule / editor or builder
  public editorUseFlag: boolean = false;
  public editorUseLabel: string = 'switch to editor';
  public editLabelBtn: string = 'Add';  // 편집 모드 버튼 라벨

  // input cmd line
  public inputRuleCmd: string = ''; // Rule을 직접 입력시

  // APPEND (룰 등록) or UPDATE (룰 수정)
  public modeType: string = 'APPEND';

  // pivot - Formula 여러개 입력받는다
  public pivotFormulaList: any[] = [];
  public pivotFormulaValueList: any[] = [];

  // input focus 여부
  public isFocus = false;

  // 툴팁 show/hide
  public isTooltipShow = false;

  // Flag for mouse movement and keyboard navigation
  public flag: boolean = false;

  // 룰 수정시 다른 룰로 바꾸면 append 되는것을 막기위한 변수 - 몇번째 룰을 편집하는지 갖고있는다
  public ruleNo: any;

  // Join / Union 편집용 룰문자열
  public editJoinOrUnionRuleStr: string;

  public commandList: any[];
  public typeList: any[] = [];
  public nestList: any[] = [];
  public moveList: any[];
  public sortList: any[];
  public beforeOrAfterDataSet: any[] = [];    // List for Rule-move
  public editColumnList = [];                 // 수정 할 컬럼 리스트
  public selectedColumns: string[] = [];     // 그리드에서 선택된 컬럼 리스트
  public selectedRows: any = [];             // 그리드에서 선택된 로우 리스트

  // tell if union is updating or just adding
  public isUpdate: boolean = false;

  // select box 에서 선택됐는지 여부
  public selectboxFlag: boolean = false;

  // Histogram
  public charts: any = [];

  // Auto complete 관련
  public autoCompleteSuggestions: any = [];
  public autoCompleteSuggestions_selectedIdx: number = -1;
  public isAutoCompleteSuggestionListOpen: boolean = false;
  public autoCompleteSuggestion_inputId: string = '';

  // Timestamp 관련
  public isTypeTimestamp: boolean = false;
  public isTimestampOpen: boolean = false;
  public timestampTime: any = [];
  public defaultTimestampTime : any = [];
  public timestampVal: string = '';
  public isTimestampEdit: boolean = false;
  public timestampSuggestions: any;

  // 그리드 헤더 클릭 이벤트 제거 ( 임시 )
  public isDisableGridHeaderClickEvent: boolean = false;

  get filteredWrangledDatasets() {
    if (this.dataflow['_embedded'].datasets.length === 0) return [];

    let list = this.dataflow['_embedded'].datasets;

    list = list.filter((dataset) => {
      return dataset.dsType.toString() === 'WRANGLED';
    }).map((data) => {
      data.current = data.dsId === this.selectedDataSet.dsId;
      return data;
    });
    return list;
  }

  // command List (search)
  get filteredCommandList() {

    let commandList = this.commandList;
    // 검색어가 있는지 체크
    const isSearchTextEmpty = StringUtil.isNotEmpty(this.commandSearchText);

    // 검색어가 있다면
    if (isSearchTextEmpty) {
      commandList = commandList.filter((item) => {
        return item.command.toLowerCase().indexOf(this.commandSearchText.toLowerCase()) > -1;
      });
    }
    return commandList;
  }

  // unnest List
  get filteredUnnestList() {
    let tempList = this.selectedDataSet.gridData.fields.filter((item) => {
      return item.type === 'MAP' || item.type === 'ARRAY';
    });

    const isUnnestSearchTextEmpty = StringUtil.isNotEmpty(this.unnestSearchText);

    // 검색어가 있다면
    if (isUnnestSearchTextEmpty) {
      tempList = tempList.filter((item) => {
        return item.type.toLowerCase().indexOf(this.unnestSearchText.toLowerCase()) > -1;
      });
    }

    return tempList;
  }

  // flatten List
  get filteredFlattenList() {
    let tempList = this.selectedDataSet.gridData.fields.filter((item) => {
      return item.type === 'ARRAY';
    });

    const isFlattenSearchTextEmpty = StringUtil.isNotEmpty(this.unnestSearchText);

    // 검색어가 있다면
    if (isFlattenSearchTextEmpty) {
      tempList = tempList.filter((item) => {
        return item.type.toLowerCase().indexOf(this.unnestSearchText.toLowerCase()) > -1;
      });
    }

    return tempList;
  }

  // column List (search)
  get filteredColumnList() {
    let columnList = this.selectedDataSet.gridData.fields;

    const isColumnSearchTextEmpty = StringUtil.isNotEmpty(this.columnSearchText);

    // 검색어가 있다면
    if (isColumnSearchTextEmpty) {
      columnList = columnList.filter((item) => {
        return item.name.toLowerCase().indexOf(this.columnSearchText.toLowerCase()) > -1;
      });
    }
    return columnList;

  }

  // type List (search)
  get filteredTypeList() {
    let tempTypeList = this.typeList;

    const isTypeSearchTextEmpty = StringUtil.isNotEmpty(this.typeSearchText);


    // 검색어가 있다면
    if (isTypeSearchTextEmpty) {
      tempTypeList = tempTypeList.filter((item) => {
        return item.name.toLowerCase().indexOf(this.typeSearchText.toLowerCase()) > -1;
      });
    }
    return tempTypeList;

  }

  get filteredMoveDatasetList() {
    let dsList = this.beforeOrAfterDataSet;
    const isMoveSearchTextEmpty = StringUtil.isNotEmpty(this.moveSearchText);


    // 검색어가 있다면
    if (isMoveSearchTextEmpty) {
      dsList = dsList.filter((item) => {
        return item.name.toLowerCase().indexOf(this.moveSearchText.toLowerCase()) > -1;
      });
    }
    return dsList;
  }

  // timestamp List
  get filteredTimestampList() {
    return this.selectedDataSet.gridData.fields.filter((item) => {
      return item.type === 'TIMESTAMP';
    })
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private popupService: PopupService,
              private dataflowService: DataflowService,
              private broadCaster: EventBroadcaster,
              protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {

    // Init
    super.ngOnInit();

    // 필드 펼침/숨김에 대한 이벤트
    this.subscriptions.push(
      this.broadCaster.on<any>('EDIT_RULE_SHOW_HIDE_LAYER').subscribe((data: { id : string, isShow : boolean }) => {
        this.isMultiColumnListShow = data.isShow;
      })
    );

    this.initViewPage();

    this.initSnapshotList(this.selectedDataSet.dsId);

    this.getTimestampFormatsFromServer(this.selectedColumns, true);
  }

  public getTimestampFormatsFromServer(columns, isInitialLoad : boolean = false) {
    if (isInitialLoad || this.selectedColumns.length > 0) {
      this.dataflowService.getTimestampFormatSuggestions(this.selectedDataSet.dsId, {colNames : columns} ).then((result) => {
        let keyList = [];
        for (let key in result) {
          if (result.hasOwnProperty(key)) {
            keyList.push(key);
          }
        }
        if (isInitialLoad) {
          this.defaultTimestampTime = [];
          for (let i in result[keyList[0]]) {
            if (result[keyList[0]].hasOwnProperty(i)) {
              this.defaultTimestampTime.push({ value: i, isHover: false, val: result[keyList[0]][i] })
            }
          }
          this.defaultTimestampTime.push({ value: 'Custom format', isHover: false });
          this.timestampTime = [];
          this.timestampTime = this.defaultTimestampTime
        } else {
          this.timestampTime = [];
          for (let i in result[keyList[0]]) {
            if (result[keyList[0]].hasOwnProperty(i)) {
              this.timestampTime.push( { value : i, isHover : false, val : result[keyList[0]][i]})
            }
          }
          if (this.selectedColumns.length > 0 && this.ruleVO.command === 'settype' &&
            'STRING' === this._findUpperCaseColumnTypeWithIdx(this._findIndexWithNameInGridResponse(this.selectedColumns[0]))) {
            let max = this.timestampTime.reduce((max, b) => Math.max(max, b.val), this.timestampTime[0].val);
            let idx = this.timestampTime.map((item) => {
              return item.val
            }).findIndex((data) => {
              return data === max
            });
            this.ruleVO.timestamp = this.timestampTime[idx].value;
          }
          this.timestampTime.push({ value: 'Custom format', isHover: false });
        }

      });
    } else {
      this.timestampTime = [];
      this.timestampTime = this.defaultTimestampTime;
      this.ruleVO.timestamp = '';
    }
  }

  /**
   * 스냅샷 리스트 초기화
   * @param {string} dsId
   * @param {boolean} changeTab
   */
  public initSnapshotList(dsId : string, changeTab : boolean = false) {

    if (changeTab) {
      this.ruleListComponent.changeTab(1);
    } else {
      this.ruleListComponent.init(dsId);
    }
  }

  public snapshotCreateClose() {
    if (1 === this.ruleListComponent.tabNumber) {
      this.ruleListComponent.getSnapshotWithInterval(this.selectedDataSet.dsId);
    }
  }

  public ngOnChanges() {
  }

  public ngAfterViewInit() {
    this._setEditRuleInfo().then();
  } // function - ngAfterViewInit

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 스냅샷 디테일 팝업 오픈
   * @param data
   */
  public getSnapshotDetail(data) {
    this.dataSnapshotDetailComponent.init(data, true);
  } // function - getSnapshotDetail

  /**
   * move to previous step
   * */
  public prev() {
    this.closeEditRule.emit();
  }

  /**
   * open create snapshot popup
   * */
  public createSnapshot() {
    // this.step = 'create-snapshot';
    this.ruleListComponent.clearSnapshotInterval();
    this.createSnapshotPopup.init({
      id: this.selectedDataSet.dsId,
      name: this.selectedDataSet.dsName,
      fields: this.selectedDataSet.gridData.fields
    });
  }

  /**
   * Join 설정 완료 이벤트
   * @param $event Join 설정 정보
   */
  public ruleJoinComplete($event) {
    if ($event.ruleInfo) {
      this.applyRule($event.ruleInfo);
    } else {
      this.initRule();
    }
    this.isRuleJoinModalShow = false;
  } // function - ruleJoinComplete

  /**
   * union 설정 완료 이벤트
   * @param $event Union 설정 정보
   */
  public ruleUnionComplete($event) {
    if ($event.ruleInfo) {
      this.applyRule($event.ruleInfo);

    } else {
      // init ruleVO
      this.initRule();
    }
    this.isRuleUnionModalShow = false;
    this.isUpdate = false;
  } // function - ruleUnionComplete

  // 좌측 상단 네비 - 다른 데이터셋 리스트 보여주는
  public showDatasets() {
    this.isOtherDatasetListShow = !this.isOtherDatasetListShow;
  }

  // switch editor
  public switchEditor() {
    if (this.editorUseFlag === true) {
      this.editorUseFlag = false;
      this.editorUseLabel = 'switch to editor';

    } else {
      this.editorUseFlag = true;
      this.editorUseLabel = 'switch to builder';
    }
    // const ruleTemp: any = { ruleVO: this.ruleVO };
    // this.setRuleVO(ruleTemp);
  }

  // command list show
  public showCommandList(event) {

    if (true == this.jumpLast()) {
      this.showCommandList(event);
    }

    event.stopImmediatePropagation();

    // 포커스 이동
    setTimeout(() => $('#commandSearch').trigger('focus'));

    this.commandSearchText = '';
    this.isCommandListShow = true;
    this.initSelectedCommand(this.filteredCommandList);

    // isCommandListShow 클릭시 다른 리스트는 모두 닫는다
    this.isColumnListShow = false;
    this.isTypeListShow = false;
    this.isMultiColumnListShow = false;
    this.isBeforeOrAfterShow = false;
    this.isBeforeOrAfterColumnListShow = false;
    this.isNestListShow = false;

    if (!this.isAutoCompleteSuggestionListOpen) {
      this.autoCompleteSuggestion_inputId = '';
    }
    this.isAutoCompleteSuggestionListOpen = false;

    this.changeDetect.detectChanges();

  }

  /**
   * Set default input values for derive, merge, nest, rename
   * isRename {boolean}
   * */
  public setDefaultValue(isRename: boolean) {

    let newColumns: number[] = [];
    this.selectedDataSet.gridData.fields.forEach(item => {
      if (0 === item.name.indexOf('new_column')) {
        newColumns.push(item.name.replace(/new_column/gi, '') * 1);
      }
    });

    newColumns.sort();

    let idx: number = newColumns.findIndex((item: number, index: number) => {
      return (item !== index + 1)
    });
    (-1 === idx) && (idx = newColumns.length);

    if (isRename) {
      this.ruleVO.to = 'new_column' + (idx + 1);
    } else {
      this.ruleVO.as = 'new_column' + (idx + 1);
    }

  } // end of setDefaultValue

  /**
   * When command is selected from commandList
   * @param event
   * @param command
   * */
  public selectCommand(event, command) {
    event.stopImmediatePropagation();
    const mode = this.modeType; // 룰 수정시 필요함
    const vo = this.ruleVO;     // 룰 수정시 필요함
    this.initRule();
    if (mode === 'UPDATE') { // 편집인데 다른 룰을 추가할때
      this.modeType = mode;
      this.editLabelBtn = 'Edit';
      this.ruleNo = vo['ruleNo'];
    }

    // ignore default 값은 false;
    this.ruleVO.ignoreCase = false;

    this.ruleVO.cols = this.selectedColumns;

    const singleSelectRule = ['rename', 'split', 'extract'];
    if (-1 !== singleSelectRule.indexOf(command.command)) {
      if (this.selectedColumns.length === 1) {
        this.ruleVO.col = this.selectedColumns[0];
      } else if (this.selectedColumns.length > 1) {
        let col = this.selectedColumns[0];
        this._editRuleGridComp.unSelectionAll();
        this._editRuleGridComp.selectColumn(col, true);
        this.ruleVO.col = col;
      }
    }

    this.ruleVO.command = command.command;
    this.ruleVO.alias = command.alias;
    this.ruleVO.desc = command.desc;

    // 검색어 초기화 및 레이어 닫기
    this.commandSearchText = '';
    setTimeout(() => {
      this.isCommandListShow = false;
    });

    this.safelyDetectChanges();

    let selectedFields:Field[] = [];
    if( this.selectedColumns ) {
      selectedFields = this.selectedColumns.map( col => this.selectedDataSet.gridData.fields.find( field => field.name === col ) );
    }

    switch (this.ruleVO.command) {
      case 'setformat':
        let setformatList = this.selectedDataSet.gridData.fields.filter((item) => {
          return item.type === 'TIMESTAMP'
        });
        let selectedsetformatList = selectedFields.filter((item) => {
          return item.type === 'TIMESTAMP'
        });
        this._editRuleComp.init(setformatList, selectedsetformatList, `dsId: ${this.selectedDataSet.dsId}`);
        break;
      case 'flatten' :
        let flattenList = this.selectedDataSet.gridData.fields.filter((item) => {
          return item.type === 'ARRAY'
        });

        let selectedFlattenList = selectedFields.filter((item) => {
          return item.type === 'ARRAY'
        });
        this._editRuleComp.init(flattenList, selectedFlattenList);
        break;
      case 'unnest':
        let unnestList = this.selectedDataSet.gridData.fields.filter((item) => {
            return item.type === 'ARRAY' || item.type === 'MAP'
        });
        let selectedUnnestList = selectedFields.filter((item) => {
          return item.type === 'ARRAY' || item.type === 'MAP'
        });
        this._editRuleComp.init(unnestList, selectedUnnestList);
        break;
      case 'join':
        this.rightDataset = new Dataset();
        this.rightDataset.dsId = '';
        this.isRuleJoinModalShow = true;
        break;
      case 'union':
        this.editJoinOrUnionRuleStr = '';
        this.isRuleUnionModalShow = true;
        break;
      case 'unpivot':
      case 'nest':
      case 'header':
      case 'sort':
      case 'drop':
      case 'rename':
      case 'replace':
      case 'merge':
      case 'move':
      case 'split':
      case 'extract':
      case 'countpattern':
        this._editRuleComp.init(this.selectedDataSet.gridData.fields, selectedFields );
        break;
      case 'derive':
      case 'keep':
      case 'delete':
      case 'set':
      case 'aggregate':
        this._editRuleComp.setRuleVO(this.ruleVO);
        this._editRuleComp.init(this.selectedDataSet.gridData.fields, selectedFields );
        break;
      case 'settype':
        this.dataflowService.getTimestampFormatSuggestions(this.selectedDataSet.dsId, { colNames: this.selectedDataSet.gridResponse.colNames })
          .then((result) => {
            this.timestampSuggestions = result;
            // this._setTimestampFormatsByColumn(result);
          }).catch((error) => {
          console.info(error);
        });
        break;
    }
    this.initSelectedCommand(this.filteredCommandList);
  }

  // column layer show
  public showColumnList(event) {
    event.stopImmediatePropagation();
    this.isColumnListShow = true;
    this.columnSearchText = ''; // 검색어 초기화
    setTimeout(() => $('.unnest-search').trigger('focus')); // 포커스
    setTimeout(() => $('.columnSearch').trigger('focus')); // 포커스

    // isColumnListShow 클릭시 다른 리스트는 모두 닫는다
    this.isTypeListShow = false;
    this.isBeforeOrAfterShow = false;
    this.isCommandListShow = false;
    this.isMultiColumnListShow = false;
    this.isBeforeOrAfterColumnListShow = false;

    this.changeDetect.detectChanges();
  }

  // column layer show for [MOVE] before or after
  public showBeforeOrAfterColumnList(event) {
    event.stopImmediatePropagation();
    this.isBeforeOrAfterColumnListShow = true;
    setTimeout(() => $('.move-search').trigger('focus'));

    // isBeforeOrAfterColumnListShow 클릭시 다른 리스트는 모두 닫는다
    this.isCommandListShow = false;
    this.isBeforeOrAfterShow = false;
    this.isColumnListShow = false;

    this.changeDetect.detectChanges();
  }

  // before or after layer show
  public showBeforeOrAfterList(event) {
    event.stopImmediatePropagation();
    this.isBeforeOrAfterShow = !this.isBeforeOrAfterShow;

    // isBeforeOrAfterShow 클릭시 다른 리스트는 모두 닫는다
    this.isColumnListShow = false;
    this.isCommandListShow = false;
    this.isBeforeOrAfterColumnListShow = false;

    this.changeDetect.detectChanges();
  }

  public showTimestampList(event) {
    event.stopImmediatePropagation();
    this.isTimestampOpen = true;
    if (!isNullOrUndefined(this.ruleVO.timestamp)) {
      let idx = this.timestampTime.findIndex((item) => {
        return item.value === this.ruleVO.timestamp
      });
      if (idx !== -1) {
        this.timestampTime[idx].isHover = true;
        setTimeout(() => {
          $('.ddp-list-command').scrollTop(idx * 25);
        });
      }
    }

    this.isColumnListShow = false;
    this.isCommandListShow = false;
    this.isMultiColumnListShow = false;
    this.isTypeListShow = false;

    this.changeDetect.detectChanges();
  }

  // type layer show
  public showTypeList(event) {
    event.stopImmediatePropagation();
    this.isTypeListShow = true;

    setTimeout(() => $('.type-search').trigger('focus')); // 포커스

    // isTypeListShow 클릭시 다른 리스트는 모두 닫는다
    this.isColumnListShow = false;
    this.isCommandListShow = false;
    this.isMultiColumnListShow = false;

    this.changeDetect.detectChanges();
  }

  /**
   * 컬럼 산택 (replace, rename, set, setType, countPattern, split, extract, flatten, move, unnest)
   * @param event 이벤트
   * @param col 컬럼 정보
   */
  public selectColumn(event, col) {
    event.stopImmediatePropagation();
    // 선택 된 컬럼 초기화
    this._editRuleGridComp.unSelectionAll('COL');

    this.ruleVO['col'] = col.name;

    this.selectboxFlag = true; // 셀렉트 박스에서 선택 했는지 flag걸기
    this._editRuleGridComp.selectColumn(col.name, true, col.type);

    this.columnSearchText = ''; // 검색어 초기화
    this.unnestSearchText = '';

    setTimeout(() => {
      this.isColumnListShow = false
    });

    this.initSelectedCommand(this.filteredColumnList);

  } // function - selectColumn

  /**
   * 컬럼 택 (move)
   * @param event 이벤트
   * @param col 컬럼 정보
   */
  public selectedBeforeOrAfterColumn(event, col) {
    event.stopImmediatePropagation();
    this.ruleVO['colForMove'] = col.name;
    this.moveSearchText = '';
    setTimeout(() => {
      this.isBeforeOrAfterColumnListShow = false;
    });

    this.initSelectedCommand(this.filteredMoveDatasetList);

  } // function - selectedBeforeOrAfterColumn

  /**
   * Array or map 산택 (nest, unnest)
   * @param event 이벤트
   * @param type 타입정보
   */
  public selectType(event, type) {
    event.stopImmediatePropagation();
    this.ruleVO['into'] = type.name;

    setTimeout(() => {
      this.isNestListShow = false;
    });

    this.initSelectedCommand(this.nestList);
  } // function - selectArrayColumn


  // multi column layer show
  public showMultiColumnList(event) {
    event.stopImmediatePropagation();
    this.isMultiColumnListShow = true;

    this.isNestListShow = false;
    this.isColumnListShow = false;
    this.isCommandListShow = false;
    this.isMultiColumnGroupListShow = false;
    this.isTypeListShow = false;

    this.changeDetect.detectChanges();
  }

  // Pivot -  multi column group layer show
  public showMultiColumnGroupList(event) {
    event.stopImmediatePropagation();
    this.isMultiColumnGroupListShow = true;

    this.isNestListShow = false;
    this.isColumnListShow = false;
    this.isCommandListShow = false;
    this.isMultiColumnListShow = false;

    this.changeDetect.detectChanges();
  }

  // nest list layer show
  public showNestList(event) {
    event.stopImmediatePropagation();
    this.isNestListShow = !this.isNestListShow;

    this.isMultiColumnListShow = false;
    this.isColumnListShow = false;
    this.isCommandListShow = false;

    this.changeDetect.detectChanges();
  }

  /**
   * 컬럼을 선택하면 무조건 실행된다. 그리드 헤거 클릭 or select box 에서 클릭도 !
   * @param col
   * @param {Field[]} fields
   */
  public setColSeq(col, fields?: Field[]) {

    (fields) || (fields = this.selectedDataSet.gridData.fields);

    if (col.selected) {

      if (isUndefined(this.ruleVO.cols)) {
        this.ruleVO.cols = [];
      }
      if (this.ruleVO.cols.indexOf(col.name) === -1) {
        this.ruleVO.cols.push(col.name);
      }
      col.seq = this.ruleVO.cols.length;
    } else {

      const fieldNames = fields.map((field) => {
        return field.name;
      });

      if (this.ruleVO.cols && this.ruleVO.cols.length > 0) {
        this.ruleVO.cols.forEach((column) => {
          const idx = fieldNames.indexOf(column);
          if (idx !== -1) {
            if (fields[idx].seq > col.seq) {
              fields[idx].seq -= 1;
            }
          }
        });
        this.ruleVO.cols.splice(this.ruleVO.cols.indexOf(col.name), 1);
      }
    }
  }

  /**
   * Select box 클릭 시 (멀티 체크박스)
   * @param col
   */
  public checkItem(col) {
    this._editRuleGridComp.selectColumn(col.name, !col.selected);
  }


  // rule - pivot
  public setGroupColSeq(col) {
    if (col.ticked) {
      this.ruleVO.groups.push(col.name);
      col.groupSeq = this.ruleVO.groups.length; // pivot에 seq를 쓰는 곳이 2개라서 groupSeq로 따로 관리
    } else {

      const fieldNames = this.selectedDataSet.gridData.fields.map((field) => {
        return field.name;
      });
      this.ruleVO.groups.forEach((column) => {
        const idx = fieldNames.indexOf(column);
        if (this.selectedDataSet.gridData.fields[idx].groupSeq > col.groupSeq) {
          this.selectedDataSet.gridData.fields[idx].groupSeq -= 1;
        }
      });

      const index = this.ruleVO.groups.indexOf(col.name);
      this.ruleVO.groups.splice(index, 1);
    }

  }

  /**
   * set column type
   * @param event 이벤트
   * @param type integer, float ect
   */
  public setColumnType(event, type) {
    event.stopImmediatePropagation();
    this.ruleVO.type = type.name;
    this.typeSearchText = '';

    // 컬럼 타입 리스트
    let colTypes = this.selectedDataSet.gridResponse.colDescs.filter((item) => {
      return item.type
    });

    // 스트링으로 변경하려면
    if ('String' === this.ruleVO.type) {

      if (this.selectedColumns.length === 1) {
        let idx = this.selectedDataSet.gridResponse.colNames.indexOf(this.selectedColumns[0]);
        if (colTypes[idx].type.toUpperCase() === 'TIMESTAMP') {
          this.ruleVO.timestamp = this._findTimestampStyleWithIdxInColDescs(idx);
          this.isTypeTimestamp = true;
        } else {
          this.isTypeTimestamp = false;
          this.ruleVO.timestamp = '';
        }
      } else if (this.selectedColumns.length > 1) {
        let timestampStyles = [];
        this.selectedColumns.forEach((item) => {
          let idx = this._findIndexWithNameInGridResponse(item);
          if ('TIMESTAMP' === this.selectedDataSet.gridResponse.colDescs[idx].type) {
            timestampStyles.push(this._findTimestampStyleWithIdxInColDescs(idx));
          }
        });
        const allEqual = arr => arr.every(v => v === arr[0]);
        if (this.selectedColumns.length === timestampStyles.length && allEqual(timestampStyles)) {
          this.isTypeTimestamp = true;
          this.ruleVO.timestamp = timestampStyles[0].replace(/'/g, '\\\'');
        } else if (timestampStyles.length > 0) {
          this.isTypeTimestamp = true;
          this.ruleVO.timestamp = '';
        } else {
          this.isTypeTimestamp = false;
        }
      } else {
        this.isTypeTimestamp = false;
        this.ruleVO.timestamp = '';
      }
      // 타임스탬프로 변경한다면
    } else if ('Timestamp' === this.ruleVO.type) {
      this.isTypeTimestamp = true;
      if (this.selectedColumns.length === 1) {
        let idx = this._findIndexWithNameInGridResponse(this.selectedColumns[0]);
        if (colTypes[idx].type.toUpperCase() === 'TIMESTAMP') {     // timestamp -> timestamp
          this.ruleVO.timestamp = this._findTimestampStyleWithIdxInColDescs(idx);
        } else if (colTypes[idx].type.toUpperCase() === 'STRING') { // string -> timestamp
          this.getTimestampFormatsFromServer(this.selectedColumns);
        }
      } else if (this.selectedColumns.length > 1) {

        let timestampStyles = [];
        let stringTimestampStyles = [];
        this.selectedColumns.forEach((item) => {
          let idx = this._findIndexWithNameInGridResponse(item);
          if ('TIMESTAMP' === this.selectedDataSet.gridResponse.colDescs[idx].type) {
            timestampStyles.push(this._findTimestampStyleWithIdxInColDescs(idx));

            const allEqual = arr => arr.every(v => v === arr[0]);
            if (this.selectedColumns.length === timestampStyles.length && allEqual(timestampStyles)) {
              this.ruleVO.timestamp = timestampStyles[0].replace(/'/g, '\\\'');
            } else if (this.selectedColumns.length === stringTimestampStyles.length && allEqual(stringTimestampStyles)) {
              this.ruleVO.timestamp = stringTimestampStyles[0].replace(/'/g, '\\\'');
            } else {
              this.ruleVO.timestamp = '';
            }
          } else if ('STRING' === this.selectedDataSet.gridResponse.colDescs[idx].type) {
            // stringTimestampStyles.push(this.timestampSuggestions && this.timestampSuggestions[item][0] ? this.timestampSuggestions[item][0] : '');
            this.getTimestampFormatsFromServer(this.selectedColumns);
          }
        });

      } else {
        this.ruleVO.timestamp = '';
      }
    } else {
      this.isTypeTimestamp = false;
      this.ruleVO.timestamp = '';
    }

    if (!this.isTypeTimestamp) {
      this.ruleVO.timestamp = '';
    }

    setTimeout(() => {
      this.isTypeListShow = false;
    });

    this.initSelectedCommand(this.filteredTypeList);
  } // function - setColumnType

  public setTimestamp(event, type) {
    event.stopImmediatePropagation();
    if ('Custom format' === type.value) {
      this.timestampVal = isUndefined(this.ruleVO.timestamp) ? '' : this.ruleVO.timestamp;
    } else if ('Custom format' !== type.value) {
      this.timestampVal = '';
    }
    this.ruleVO.timestamp = type.value;

    setTimeout(() => {
      this.isTimestampOpen = false;
    });
    this.initSelectedCommand(this.timestampTime);
  } // function - setColumnType

  /**
   * select BEFORE or AFTER (move)
   * @param event 이벤트
   * @param type BEFORE or AFTER
   */
  public setBeforeOrAfter(event, type) {

    event.stopImmediatePropagation();
    this.ruleVO.beforeOrAfter = type.name;
    setTimeout(() => {
      this.isBeforeOrAfterShow = false;
    });

    this.initSelectedCommand(this.moveList);

  } // function - setBeforeOrAfter

  /**
   * Rule cancel or 초기 세팅
   * @param data
   */
  public initRule(data?) {

    // default 는 append
    this.modeType = 'APPEND';

    // default 는 Add
    this.editLabelBtn = 'Add';

    // 룰 리스트에서 선택된 룰이 없게 this.ruleNo 초기화
    this.ruleNo = null;

    this.ruleVO = new Rule();
    this.beforeOrAfterDataSet = this.selectedDataSet.gridData.fields;
    this.inputRuleCmd = '';
    this.timestampInit();

    // redo, undo를 초기화 한다.
    if (data) this.initRedoUndo(data);

    // init pivot & aggregate formulas
    this.initFormulaList();

  } // function - initRule

  public timestampInit() {
    this.isTypeTimestamp = false;
    this.isTimestampOpen = false;
  }

  /**
   * Initialise formula list
   */
  public initFormulaList() {
    this.pivotFormulaList = [];
    this.pivotFormulaList.push('');
    this.pivotFormulaValueList = [];
  } // function - initFormulaList

  /**
   * Initialise redo and undo buttons
   * @param data
   */
  public initRedoUndo(data) {

    switch (data.redoable) {
      case 'true':
        this.redoable = true;
        break;
      case 'false' :
        this.redoable = false;
        break;
    }

    switch (data.undoable) {
      case 'true':
        this.undoable = true;
        break;
      case 'false' :
        this.undoable = false;
        break;
    }
  } // function - initRedoUndo

  /**
   * Apply rule. (When Add button is clicked)
   */
  public addRule() {

    let rule: any = {};
    if (this.editorUseFlag === false) {
      if (isUndefined(this.ruleVO['command']) || '' === this.ruleVO['command']) {
        Alert.warning(this.translateService.instant('msg.dp.alert.no.data'));
        return;
      }

      switch (this.ruleVO['command']) {
        case 'keep':
        case 'derive':
        case 'delete':
        case 'rename':
        case 'merge':
        case 'sort':
        case 'replace':
        case 'drop':
        case 'header':
        case 'set':
        case 'nest':
        case 'unpivot':
        case 'move':
        case 'flatten':
        case 'unnest':
        case 'split' :
        case 'extract' :
        case 'countpattern' :
        case 'setformat' :
        case 'aggregate' :
          rule = this._editRuleComp.getRuleData();
          if (isUndefined(rule)) {
            return;
          }
          break;
        case 'settype' :
          rule = this.setSettypeRule();
          break;
        case 'pivot' :
          rule = this.setPivotRule();
          break;
        default :
          break;
      }

      // 룰 적용하기
      // set operation
      if (!isUndefined(rule)) {
        if (isUndefined(this.ruleVO['ruleNo'])) {
          if (!isNull(this.ruleNo)) { //룰 편집 수정 중 다른 룰로 바꾸면 append -> update로 수정
            rule['op'] = 'UPDATE';
          } else {
            rule['op'] = 'APPEND';
          }

        } else {// 수정 모드
          rule['op'] = 'UPDATE';
          rule['ruleCurIdx'] = this.ruleVO['ruleNo'];
        }
      }
    } else {  // editor 사용시
      if (this.inputRuleCmd === '') {
        Alert.warning(this.translateService.instant('msg.dp.alert.editor.warn'));
        return;
      }
      let cmd = this.inputRuleCmd;
      cmd = cmd.substring(0, cmd.indexOf(' '));
      const ruleIdx = this.ruleList.length;


      if (this.modeType === 'APPEND') {
        rule = {
          command: cmd,
          op: this.modeType,
          rownum: ruleIdx + 1,
          ruleString: this.inputRuleCmd
        };
      } else if (this.modeType === 'UPDATE') {
        rule = {
          command: cmd,
          op: this.modeType,
          rownum: this.ruleVO.rownum,
          ruleString: this.inputRuleCmd
        };
      }
    }
    if (!isUndefined(rule)) {
      if ('UPDATE' === rule['op']) {
        this.dataflowService.getSearchCountDataSets(this.selectedDataSet.dsId, rule['ruleCurIdx'], 0, 2)
          .then(() => {  // ruleIdx 값을 맞추기 위해서 호출 후에 제거해야 함
            this.applyRule(rule);
          });
      } else {
        this.applyRule(rule);
      }
    }
  } // function - addRule

  /**
   * 편집시 기존의 수식이 각 위치에 들어간다
   * @param rule : rule 수정할 rule 정보
   * @param gridData
   */
  public setEditInfo(rule, gridData:any) {

    // 선택된 컬럼이 있다면 클리어 한다.
    this._editRuleGridComp.unSelectionAll('COL');

    try {
      this.selectboxFlag = true;
      this.initRule();
      this.modeType = 'UPDATE';
      this.editLabelBtn = 'Edit';
      this.ruleVO = rule['ruleVO'];
      ('' === this.ruleVO.command) && (this.ruleVO.command = this.ruleVO['name']);

      this.isDisableGridHeaderClickEvent = true;

      this.safelyDetectChanges();

      switch (this.ruleVO.command) {
        case 'setformat':
          let setformatList = gridData.fields.filter((item) => {
            return item.type === 'TIMESTAMP'
          });
          this._editRuleComp.init(setformatList, [], `${rule.ruleString} dsId: ${this.selectedDataSet.dsId}`);
          break;
        case 'flatten' :
          let flattenList = gridData.fields.filter((item) => {
            return item.type === 'ARRAY'
          });
          this._editRuleComp.init(flattenList, [], rule.ruleString);
          break;
        case 'unnest' :
          let unnest = gridData.fields.filter((item) => {
            return item.type === 'ARRAY' || item.type === 'MAP'
          });
          this._editRuleComp.init(unnest, [], rule.ruleString);
          break;
        case 'rename':
          if (this.ruleVO.col['value'] && 'string' === typeof this.ruleVO.col['value']) {
            this._editRuleComp.init(gridData.fields, [], rule.ruleString);
          } else {
            let tos = [];
            this.ruleVO.to['value'].forEach((item) => {
              if (item.startsWith('\'') && item.endsWith('\'')) {
                tos.push(item.substring(1, item.length - 1));
              }
            });
            let cols = _.cloneDeep(this.ruleVO.col['value']);
            this.multicolumnRenameComponent.init({
              data: _.cloneDeep(gridData),
              datasetName: this.selectedDataSet.dsName,
              ruleCurIdx: rule['ruleNo'],
              cols: cols,
              to: tos
            });
            // TODO : ... 지우면 안되는데..
            this.ruleVO.col = '';
            this.ruleVO.to = '';
          }
          break;
        case 'delete':
        case 'keep':
        case 'derive':
          let row = rule.ruleString.split(': ');
          this.ruleVO['row'] = row[1];
          this._editRuleComp.setRuleVO(this.ruleVO);
          this._editRuleComp.init(gridData.fields, [], rule.ruleString);
          break;
        case 'set':
          let rowString = rule.ruleString.split('value: ');
          rowString = rowString[1].split(' row: ');
          this.ruleVO.row = rowString[0];
          this._editRuleComp.setRuleVO(this.ruleVO);
          this._editRuleComp.init(gridData.fields, [], rule.ruleString);
          break;
        case 'drop':
        case 'replace':
        case 'merge':
        case 'sort':
        case 'header':
        case 'nest':
        case 'unpivot':
        case 'move':
        case 'split' :
        case 'extract' :
        case 'countpattern' :
        case 'aggregate' :
          this._editRuleComp.init(gridData.fields, [], rule.ruleString);
          break;
        case 'settype':
          if (isNullOrUndefined(this.ruleVO.cols)) {
            const colVal = this.ruleVO['col']['value'];
            this.ruleVO.cols = (colVal instanceof Array) ? colVal : [colVal];
          }
          this._setSelectionFields(this.selectedDataSet.gridData.fields, this.ruleVO.cols);
          this.setSettypEditInfo(rule);
          break;
        case 'pivot' :
          if (isNullOrUndefined(this.ruleVO.cols)) {
            const colVal = this.ruleVO['col']['value'];
            this.ruleVO.cols = (colVal instanceof Array) ? colVal : [colVal];
          }
          this._setSelectionFields(this.selectedDataSet.gridData.fields, this.ruleVO.cols);
          this.setPivotEditInfo(rule);
          break;
        case 'union' :
          if (this.selectedDataSet.gridData.data.length > 1) {
            this.editJoinOrUnionRuleStr = rule['jsonRuleString'];
            this.isUpdate = true;
            this.isRuleUnionModalShow = true;
          } else {
            Alert.warning('No rows to union');
          }

          break;
        case 'join' :

          if (this.selectedDataSet.gridData.data.length > 1) {
            this.setJoinEditInfo(rule);
          } else {
            Alert.warning('No rows to join');
          }
          break;
        default:
          break;
      }

      this.isDisableGridHeaderClickEvent = false;

      this.inputRuleCmd = PreparationCommonUtil.makeRuleResult(this.ruleVO);
    } catch (e) {
      Alert.error(this.translateService.instant('msg.dp.alert.rule.edit.fail'));
    }
  } // function - setEditInfo


  /**
   * 룰 수정 클릭시
   * @param dataRule 수정할 룰 정보
   */
  public setRuleVO(dataRule) {

    // 전 단계 그리드를 그리기 전에 현재 그리드에 선택된 컬럼을 해제 해야한다.
    this._editRuleGridComp.unSelectionAll('COL');

    let event = dataRule.event;
    let rule = dataRule.rule;

    // 인풋박스 포커스 여부 IE 에서 수정버튼을 누르면 툴팁 박스가 열려서...
    this.isFocus = false;

    if (true == this.jumpLast()) {
      this.setRuleVO({ rule: rule, event: event });
      return;
    }

    event.stopPropagation();
    this.loadingShow();

    const op = { op: 'FETCH' };
    // fetch data 1 step before
    this.dataflowService.fetchPreviousData(this.selectedDataSet.dsId, op).then((data) => {
      if (data.errorMsg) {
        Alert.warning(this.translateService.instant('msg.dp.alert.rule.edit.fail'));
      } else {
        this._setEditRuleInfo(data.ruleCurIdx !== -1 ? data.ruleCurIdx - 1 : data.ruleCurIdx)
          .then((data: { apiData: any, gridData: any }) => {
            this.setEditInfo(rule, data.gridData);
          });
      }
      this.loadingHide();
    }).catch((error) => {
      this.loadingHide();
      let prep_error = this.dataprepExceptionHandler(error);
      PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
    });

  } // function - setRuleVO

  /**
   * Delete rule
   * @param dataEvent
   */
  public deleteRule(dataEvent) {

    let event = dataEvent.event;
    let data = dataEvent.rule;

    if (true == this.jumpLast()) {
      this.deleteRule({ rule: data, event: event });
    }

    event.stopPropagation();

    const rule = {
      op: 'DELETE',
      ruleIdx: data.ruleNo
    };

    this.applyRule(rule, 'msg.dp.alert.rule.del.fail');
  } // function - deleteRule

  /**
   * Change to different dataset in same dataflow
   */
  public changeWrangledDataset(dataset) {
    this.loadingShow();

    let dataflows = this.selectedDataSet['_embedded'].dataflows ? this.selectedDataSet['_embedded'].dataflows : null;

    delete this.selectedDataSet;
    this.selectedDataSet = dataset;

    if (!this.selectedDataSet['_embedded']) {
      this.selectedDataSet['_embedded'] = {};
    }
    if (!this.selectedDataSet['_embedded'].dataflows && null != dataflows) {
      this.selectedDataSet['_embedded'].dataflows = dataflows;
    }

    this.dataflowService.getDatasetWrangledData(dataset.dsId)
      .then((result) => {

        /*
          this.selectedDataSet.gridResponse = result.gridResponse;
          // grid refresh
          this.selectedDataSet.gridData = this._editRuleGridComp.init(this.selectedDataSet.dsId);
          // rule refresh
          this.setRuleList(result['ruleStringInfos']);
          // init ruleVO
          this.initRule();

          this.changeDataset.emit(this.selectedDataSet);
         */

        this.selectedDataSet.dsId = dataset.dsId;
        this._setEditRuleInfo();

      })
      .catch((error) => {
        this.loadingHide();
        let prep_error = this.dataprepExceptionHandler(error);
        PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
      });

  } // function - changeWrangledDataset

  /**
   * REDO rule
   */
  public redoRule() {

    if (!this.redoable) {
      return;
    }

    if (this.isRedoRunning === false) {
      this.isRedoRunning = true;
      const rule = { op: 'REDO', ruleString: '' };
      this.applyRule(rule, 'msg.dp.alert.redo.fail', false)

    }
  } // function - redoRule

  /**
   * UNDO rule
   */
  public undoRule() {

    if (!this.undoable) {
      return;
    }

    if (this.isUndoRunning === false) {
      this.isUndoRunning = true;

      const rule = { op: 'UNDO', ruleString: '' };

      this.applyRule(rule, 'msg.dp.alert.undo.fail', true);

    }

  } // function - undoRule

  /**
   * Jump to last index
   */
  public jumpLast() {
    let lastIdx = this.ruleList.length - 1;
    if (this.isJumped == true && 0 <= lastIdx) {
      this.isJumped = false;
      this.jump(lastIdx);
      return true;
    }
    return false;
  } // function - jumpLast

  /**
   * Jump
   * @param idx
   */
  public jump(idx: number) {
    // 현재 rule index
    this.currentIndex = idx;

    // 선택된 컬럼이 있다면 클리어 한다.
    this._editRuleGridComp.unSelectionAll();

    this.isJumped = this.ruleList.length - 1 != idx;

    this.loadingShow();

    // TODO : jumpRule, applyRule 은 같은 API
    this.dataflowService.jumpRule(this.selectedDataSet.dsId, 'JUMP', idx)
      .then((data) => {
        if (data.errorMsg) {
          Alert.warning(this.translateService.instant('msg.dp.alert.jump.fail'));
        } else {
          this._setEditRuleInfo(idx).then(() => {
            data.gridResponse.interestedColNames.forEach(col => {
              this._editRuleGridComp.selectColumn(col, true);
            });
            this.setRuleListColor(idx, this.isJumped);
          });
        }

        this.loadingHide();

      })
      .catch((error) => {
        this.loadingHide();
        let prep_error = this.dataprepExceptionHandler(error);
        PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
      });
  } // function - jump

  /**
   * Delete formula input box for PIVOT & AGGREGATE
   * @idx index for deletion
   */
  public deleteFormula(idx) {

    if (this.pivotFormulaList.length === 1) {
      Alert.warning('Cannot delete Formula');
    } else {
      this.pivotFormulaValueList.splice(idx, 1);
      this.pivotFormulaList.splice(idx, 1);
    }
  } // function - deleteFormula

  /**
   * Command list 에서 Mouseover 일때 Selected = true, mouseleave 일때 selected = false
   * @param event 이벤트
   * @param index
   */
  public commandListHover(event, index) {

    if (!this.flag) {
      if (event.type === 'mouseover') {
        this.filteredCommandList[index].isHover = true;

      } else if (event.type === 'mouseout') {
        this.initSelectedCommand(this.filteredCommandList);
      }
    }
  } // function - commandListHover

  /**
   * nestlist, typelist, movelist 에서 mouseover 일때 Selected = true
   * @param event
   * @param list
   * @param index
   */
  public listMouseOver(event, list, index) {

    let tempList = [];
    switch (list) {
      case 'nest':
        tempList = this.nestList;
        break;
      case 'move':
        tempList = this.moveList;
        break;
      case 'type':
        tempList = this.typeList;
        break;
      case 'sort':
        tempList = this.sortList;
        break;
      case 'column1' :
        tempList = this.filteredColumnList;
        break;
      case 'column2' :
        tempList = this.filteredMoveDatasetList;
        break;
      case 'flatten' :
        tempList = this.filteredFlattenList;
        break;
      case 'unnest' :
        tempList = this.filteredUnnestList;
        break;
      case 'timestamp' :
        tempList = this.timestampTime;
        break;
    }
    if (!this.flag) {
      tempList[index].isHover = true;
    }
  } // function - listMouseOver

  /**
   * nestlist, typelist, patternlist,movelist, quotelist 에서 mouseout 일때 Selected = false
   * @param event
   * @param list
   */
  public listMouseOut(event, list) {

    let tempList = [];
    switch (list) {
      case 'nest':
        tempList = this.nestList;
        break;
      case 'move':
        tempList = this.moveList;
        break;
      case 'type':
        tempList = this.typeList;
        break;
      case 'sort':
        tempList = this.sortList;
        break;
      case 'column1' :
        tempList = this.filteredColumnList;
        break;
      case 'column2' :
        tempList = this.filteredMoveDatasetList;
        break;
      case 'flatten' :
        tempList = this.filteredFlattenList;
        break;
      case 'unnest' :
        tempList = this.filteredUnnestList;
        break;
      case 'timestamp' :
        tempList = this.timestampTime;
        break;
    }
    if (!this.flag) {
      this.initSelectedCommand(tempList);
    }
  } // function - listMouseOut

  /**
   * Select box for commands - navigate with keyboard
   * @param event 이벤트
   * @param currentList 현재 사용하는 리스트
   * @param clickHandler
   */
  public navigateWithKeyboardShortList(event, currentList, clickHandler) {

    // open select box when arrow up/ arrow down is pressed
    if (event.keyCode === 38 || event.keyCode === 40) {
      switch (clickHandler) {
        case 'move' :
          !this.isBeforeOrAfterShow ? this.isBeforeOrAfterShow = true : null;
          break;
        case 'nest' :
          !this.isNestListShow ? this.isNestListShow = true : null;
          break;
        case 'type':
          if (!this.isTypeListShow) {
            this.isTypeListShow = true;
            setTimeout(() => $('.type-search').trigger('focus')); // 포커스
          }
          break;
        case 'column1':
        case 'unnestList':
        case 'flatten':
          if (!this.isColumnListShow) {
            this.isColumnListShow = true;
            setTimeout(() => $('.columnSearch').trigger('focus')); // 포커스
          }
          break;
        case 'column2':
          !this.isBeforeOrAfterColumnListShow ? this.isBeforeOrAfterColumnListShow = true : null;
          break;
        case 'timestamp':
          !this.isTimestampOpen ? this.isTimestampOpen = true : null;
          break;
        case 'command':
          if (!this.isCommandListShow) {
            this.isCommandListShow = true;
            setTimeout(() => $('#commandSearch').trigger('focus')); // 포커스
          }
          break;
      }
    }

    // when there is no element in the list
    if (currentList.length === 0) {
      return;
    }

    // set scroll height
    let height = 25;
    if (clickHandler == 'command') {
      height = 50;
    }

    // this.commandList 에 마지막 인덱스
    let lastIndex = currentList.length - 1;

    // command List 에서 selected 된 index 를 찾는다
    const idx = currentList.findIndex((command) => {
      if (command.isHover) {
        return command;
      }
    });
    // when Arrow up is pressed
    if (event.keyCode === 38) {

      // 선택된게 없다
      if (idx === -1) {

        // 리스트에 마지막 인덱스를 selected 로 바꾼다
        currentList[lastIndex].isHover = true;

        // 스크롤을 마지막으로 보낸다
        $('.ddp-list-command').scrollTop(lastIndex * height);

        // 리스트에서 가장 첫번쨰가 선택되어 있는데 arrow up 을 누르면 리스트에 마지막으로 보낸다
      } else if (idx === 0) {

        currentList[0].isHover = false;
        currentList[lastIndex].isHover = true;


        // 스크롤을 마지막으로 보낸다
        $('.ddp-list-command').scrollTop(lastIndex * height);

      } else {
        currentList[idx].isHover = false;
        currentList[idx - 1].isHover = true;
        $('.ddp-list-command').scrollTop((idx - 1) * height);
      }

      // when Arrow down is pressed
    } else if (event.keyCode === 40) {

      // 리스트에 첫번째 인텍스를 selected 로 바꾼다
      if (idx === -1) {
        currentList[0].isHover = true;

        // 리스트에서 가장 마지막이 선택되어 있는데 arrow down 을 누르면 다시 리스트 0번째로 이동한다
      } else if (idx === lastIndex) {

        currentList[0].isHover = true;
        currentList[lastIndex].isHover = false;
        $('.ddp-list-command').scrollTop(0);

      } else {
        currentList[idx].isHover = false;
        currentList[idx + 1].isHover = true;
        $('.ddp-list-command').scrollTop((idx + 1) * height);

      }

    }

    // enter
    if (event.keyCode === 13) {

      // selected 된 index 를 찾는다
      const idx = currentList.findIndex((command) => {
        if (command.isHover) {
          return command;
        }
      });

      // 선택된게 없는데 엔터를 눌렀을때
      if (idx === -1) {
        // if (this.ruleVO.command === 'settype' && this.timestampInputVal.nativeElement.value !== ''){
        //   this.ruleVO.timestamp = this.timestampInputVal.nativeElement.value;
        //   this.timestampInputVal.nativeElement.value = '';
        //   setTimeout(() => this.isTimestampOpen = false);
        //
        // }
        // return;
      } else {
        switch (clickHandler) {
          case 'move' :
            this.setBeforeOrAfter(event, currentList[idx]);
            break;
          case 'nest' :
            this.selectType(event, currentList[idx]);
            break;
          case 'type':
            this.setColumnType(event, currentList[idx]);
            break;
          case 'column1':
            this.selectColumn(event, currentList[idx]);
            $('[tabindex=2]').trigger('focus');
            break;
          case 'unnestList':
            this.selectColumn(event, currentList[idx]);
            break;
          case 'column2':
            this.selectedBeforeOrAfterColumn(event, currentList[idx]);
            break;
          case 'command':
            this.selectCommand(event, currentList[idx]);
            $('[tabindex=1]').trigger('focus');
            break;
          case 'timestamp':
            this.setTimestamp(event, currentList[idx]);
            break;
          default:
            this.selectColumn(event, currentList[idx]);
            break;

        }
      }
      // 스크롤, command select 초기화
      this.initSelectedCommand(currentList);
    }
  }

  // noinspection JSMethodCanBeStatic
  /**
   * change commandList selected -> false (초기화)
   */
  public initSelectedCommand(list) {
    list.forEach((item) => {
      return item.isHover = false;
    })
  } // function - initSelectedCommand


  /**
   * Set colour to rule list when jumped
   */
  public setRuleListColor(idx, renew) {

    if (renew) {
      this.ruleList.forEach((item, index) => {
        item.colored = !(index === idx || index < idx);
      });
    } else {
      this.ruleList.forEach((item) => {
        item.colored = false;
      });
    }

  }

  /**
   * 수식 입력 팝업 오픈
   * @param {string} command 수식 입력 실행 커맨드
   */
  public openPopupFormulaInput(command: string) {
    const fields: Field[] = this.selectedDataSet.gridData.fields;
    this.extendInputFormulaComponent.open(fields, command);
  } // function - openPopupFormulaInput

  /**
   * 수식 입력 종료 및 적용
   * @param {{command: string, formula: string}} data
   */
  public doneInputFormula(data: { command: string, formula: string }) {
    switch (data.command) {

      case 'set' :
      case 'keep' :
      case 'derive' :
      case 'delete':
        this.ruleVO.row = data.formula;
        this._editRuleComp.init(this.selectedDataSet.gridData.fields, []);
        this._editRuleComp.setRuleVO(this.ruleVO);
        break;
      default :
        this.ruleVO.row = data.formula;
    }
  } // function - doneInputFormaul

  /**
   * 전체 컬럼에 대한 Rename 실행
   * @param data
   */
  public applyMultiColumnRename(data) {
    if( 'UPDATE' === data.op ) {
      this.dataflowService.getSearchCountDataSets(this.selectedDataSet.dsId, data['ruleCurIdx'], 0, 2)
        .then(() => {  // ruleIdx 값을 맞추기 위해서 호출 후에 제거해야 함
          this.applyRule(data);
        });
    } else {
      this.applyRule(data);
    }
  } // function - applyMultiColumnRename

  /**
   * Removes unnecessary single quotation from string
   * @param rule rule sent to server
   */
  public removeQuotes(rule) {

    if (rule.command === 'aggregate' || rule.command === 'pivot' && rule.value) {
      let list = rule.value.split(',');
      list.forEach((item, idx) => {
        if (item.startsWith('\'') && item.endsWith('\'')) {
          this.pivotFormulaValueList[idx] = item.substring(1, item.length - 1);
        }
      });
    }

    let tempList = ['idx', 'on', 'with', 'as', 'value', 'timestamp'];

    tempList.filter((item) => {

      if (rule[item] && rule[item].startsWith('\'') && rule[item].endsWith('\'')) {
        this.ruleVO[item] = rule[item].substring(1, rule[item].length - 1);
      }
    })
  }

  /**
   * Simplify Rule List
   * @param rule
   * @param ruleString
   */
  public simplifyRule(rule: any, ruleString?: string) {

    let result: string;
    let column: string;

    if (rule.col) {
      if ('string' === typeof rule.col) {
        column = rule.col;
      } else if ('string' === typeof rule.col.value) {
        column = rule.col.value;
      } else if (rule.col.value.length === 2) {
        column = rule.col.value.join(', ');
      } else {
        column = `${rule.col.value.length} columns`;
      }
    }

    switch (rule.command) {
      case 'header':
        result = `Convert row${rule.rownum} to header`;
        break;
      case 'keep':
        let row = ruleString.split(': ');
        result = `Keep rows where ` + row[1];
        break;
      case 'rename':

        let toString: string = '';
        if ('string' === typeof rule.to.value) {
          toString = ` to '${rule.to['escapedValue']}'`;
        } else if (rule.to.value.length === 2) {
          toString = ` to ${rule.to['value'].join(', ')}`;
        }
        result = `Rename ${column}${toString}`;
        break;
      case 'nest' :
        result = `Convert ${column} into ${rule.into}`;
        break;
      case 'unnest' :
        result = `Create new columns from ${column}`;
        break;
      case 'setformat':
        let fomatStr: string;
        if ('string' === typeof rule.col.value) {
          fomatStr = `${column} type`
        } else if (rule.col.value.length === 2) {
          fomatStr = `${column} types`;
        } else {
          fomatStr = column;
        }
        result = `Set ${fomatStr} format to ${ rule.format }`;
        break;
      case 'settype':

        let columnStr: string;
        if ('string' === typeof rule.col.value) {
          columnStr = `${column} type`
        } else if (rule.col.value.length === 2) {
          columnStr = `${column} types`;
        } else {
          columnStr = column;
        }

        result = `Change ${columnStr} to ${ rule.type }`;

        break;
      case 'delete':
        const deleteCondition = ruleString.split('row: ');
        result = `Delete rows where ${deleteCondition[1]}`;
        break;
      case 'set':
        let rowString = ruleString.split('value: ');
        result = `Set ${column} to ${rowString[1]}`;
        break;
      case 'split':
        result = `Split ${rule.col} into ${rule.limit + 1 > 1 ? rule.limit + 1 + ' columns' : rule.limit + 1 + ' column'} on ${rule.on.value}`;
        break;
      case 'extract':
        result = `Extract ${rule.on.value} ${rule.limit > 1 ? rule.limit + ' times' : rule.limit + ' time'} from ${rule.col}`;
        break;
      case 'flatten':
        result = `Convert arrays in ${rule.col} to rows`;
        break;
      case 'countpattern':
        result = `Count occurrences of ${rule.on.value} in ${column}`;
        break;
      case 'sort':
        if ('string' === typeof rule.order.value) {
          result = `Sort row by ${rule.type && rule.type['escapedValue'] === 'desc' ? '-' + rule.order.value : rule.order.value}`;
          break;
        } else {
          result = `Sort rows by ${rule.type && rule.type['escapedValue'] === 'desc' ? '-' + rule.order.value.toString() : rule.order.value.toString()}`;
          break;
        }
      case 'replace':
        result = `Replace ${rule.on.value} from `;
        if ('string' === typeof rule.col.value) {
          result += `${rule.col.value} with ${rule.with['value']}`;
        } else if (rule.col.value.length === 2) {
          result += `${rule.col.value.join(', ')} with ${rule.with['value']}`;
        } else {
          result += column;
        }
        break;
      case 'merge':
        result = `Concatenate ${column} separated by ${rule.with}`;
        break;
      case 'aggregate':
        result = `Aggregate with ${rule.value.escapedValue ? rule.value.escapedValue : rule.value.value.length + ' functions'} grouped by `;
        if ('string' === typeof rule.group.value) {
          result += `${rule.group.value}`
        } else if (rule.group.value.length === 2) {
          result += `${rule.group.value.join(', ')}`
        } else {
          result += `${rule.group.value.length} columns`
        }
        break;
      case 'move':
        result = `Move ${column}`;
        result += `${rule.before ? ' before ' + rule.before : ' after ' + rule.after }`;
        break;
      case 'union':
      case 'join':
        result = `${rule.command} with `;

        let datasetIds = [];
        if (rule.dataset2.escapedValue) {
          datasetIds = [rule.dataset2.escapedValue]
        } else {
          rule.dataset2.value.forEach((item) => {
            datasetIds.push(item.substring(1, item.length - 1))
          })
        }

        if (datasetIds.length === 1) {
          result += `${this.selectedDataSet.gridResponse.slaveDsNameMap[datasetIds[0]]}`;
        } else if (datasetIds.length === 2) {
          result += `${this.selectedDataSet.gridResponse.slaveDsNameMap[datasetIds[0]]}, ${this.selectedDataSet.gridResponse.slaveDsNameMap[datasetIds[1]]}`;
        } else {
          result += `${datasetIds.length} datasets`;
        }

        break;
      case 'derive':
        let deriveCondition = ruleString.split('value: ');
        deriveCondition = deriveCondition[1].split(' as: ');
        result = `Create ${rule.as} from ${deriveCondition[0]}`;
        break;
      case 'pivot':
        let formula = '';
        if (rule.value.escapedValue) {
          formula = rule.value.escapedValue
        } else {
          let list = [];
          rule.value.value.forEach((item) => {
            list.push(item.substring(1, item.length - 1));
          });
          formula = list.toString();
        }
        result = `Pivot ${column} and compute ${formula} grouped by`;

        if ('string' === typeof rule.group.value || rule.group.value.length === 2) {
          result += ` ${rule.group.value}`;
        } else {
          result += ` ${rule.group.value.length} columns`;
        }
        break;
      case 'unpivot':
        result = `Convert `;
        if ('string' === typeof rule.col.value) {
          result += `${rule.col.value} into row`;
        } else if (rule.col.value.length > 1) {
          result += `${column} into rows`;
        }
        break;
      case 'drop':
        result = `Drop ${column}`;
        break;

    }
    return result
  }

  /**
   * Multicolumn rename popup open
   */
  public onMultiColumnRenameClick() {
    let clonedGridData = _.cloneDeep(this.selectedDataSet.gridData);
    if (this.modeType === 'UPDATE') {
      this.multicolumnRenameComponent.init({
        data: clonedGridData,
        datasetName: this.selectedDataSet.dsName,
        ruleCurIdx: this.ruleVO['ruleNo'],
        cols: this.ruleVO.cols,
        to: [this.ruleVO.to]
      });
    } else {
      this.multicolumnRenameComponent.init({
        data: clonedGridData,
        datasetName: this.selectedDataSet.dsName
      });
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - for EditRuleGrid
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 그리드 헤더 클릭을 통해서 룰 정보 설정
   * @param {{id:string, isSelect:boolean, column: any, field: any}} data
   */
  public setRuleInfoFromGridHeader(data: { id: string, isSelect: boolean, columns: any, fields: any }) {

    if (this.isDisableGridHeaderClickEvent) {
      return;
    }

    this.selectedColumns = data.columns;

    // 선택된 컬럼 중 첫번째를 셀렉트박스 인풋에 보여준다.
    this.ruleVO.col = data.columns[0];

    // 셀렉트박스에서 컬럼 클릭 시
    if (this.selectboxFlag) {
      this.selectedDataSet.gridData.fields.forEach((item) => {
        if (item.name === data.id) {
          item.selected = data.isSelect;
          item.seq = 1;
          this.setColSeq(item);
          this.selectboxFlag = false;
        }
      });
      this._editRuleGridComp.moveScrollHorizontally(this.ruleVO.col);
    } else { // 그리드에서 헤더 클릭시
      this.selectedDataSet.gridData.fields.forEach((item) => {
        if (item.name === data.id) {
          item.selected = data.isSelect;
          this.setColSeq(item);
        }
      })
    }

    if (this.ruleVO.command === 'rename' || this.ruleVO.command === 'split' || this.ruleVO.command === 'extract') {

      this.ruleVO.col = this.selectedColumns.length === 0 ? '' : this.selectedColumns[0];

    } else if (this.ruleVO.command === 'unnest') {
      if (this.selectedColumns.length === 1) { // multi select 지원 안함
        this.selectedDataSet.gridData.fields.filter((item) => { // type 확인
          if (item.name === this.selectedColumns[0]) {
            if (item.type === 'ARRAY' || item.type === 'MAP') {
              this.ruleVO.col = this.selectedColumns[0];
              // this.moveScrollHorizontally(this.ruleVO.col);
            } else {
              this.ruleVO.col = '';
            }
          }
        });
      } else {
        this.ruleVO.col = '';
      }
    } else if (this.ruleVO.command === 'flatten') {
      if (this.selectedColumns.length === 1) { // multi select 지원 안함
        this.selectedDataSet.gridData.fields.filter((item) => { // type 확인
          if (item.name === this.selectedColumns[0]) {
            if (item.type === 'ARRAY') {
              this.ruleVO.col = this.selectedColumns[0];
              // this.moveScrollHorizontally(this.ruleVO.col);

            } else {
              this.ruleVO.col = '';
            }
          }
        });
      } else {
        this.ruleVO.col = '';
      }
    } else if (this.ruleVO.command === 'settype' && this.ruleVO.type) {
      if ('string' === this.ruleVO.type.toLowerCase()) {

        let timestampStyles = [];
        this.selectedColumns.forEach((item) => {
          let idx = this._findIndexWithNameInGridResponse(item);
          if ('TIMESTAMP' === this._findUpperCaseColumnTypeWithIdx(idx)) {
            timestampStyles.push(this._findTimestampStyleWithIdxInColDescs(idx));
          }
        });
        const allEqual = arr => arr.every(v => v === arr[0]);
        if (timestampStyles.length !== 0 && this.selectedColumns.length === timestampStyles.length && allEqual(timestampStyles)) {
          this.isTypeTimestamp = true;
          this.ruleVO.timestamp = timestampStyles[0].replace(/'/g, '\\\'');
        } else if (timestampStyles.length > 0) {
          this.isTypeTimestamp = true;
          this.ruleVO.timestamp = '';
        } else {
          this.isTypeTimestamp = false;
        }

      } else if ('timestamp' === this.ruleVO.type.toLowerCase()) {
        this.isTypeTimestamp = true;

        let timestampStyles = [];
        let stringTimestampStyles = [];
        if (this.selectedColumns.length > 0) {
          this.selectedColumns.forEach((item) => {
            let idx = this._findIndexWithNameInGridResponse(item);
            if ('TIMESTAMP' === this._findUpperCaseColumnTypeWithIdx(idx)) {
              timestampStyles.push(this._findTimestampStyleWithIdxInColDescs(idx));
            } else if ('STRING' === this._findUpperCaseColumnTypeWithIdx(idx)) {
              stringTimestampStyles.push(this.timestampSuggestions && this.timestampSuggestions[item][0] ? this.timestampSuggestions[item][0] : '');
            }
          });
          const allEqual = arr => arr.every(v => v === arr[0]);
          if (timestampStyles.length !== 0 && this.selectedColumns.length === timestampStyles.length && allEqual(timestampStyles)) {
            this.ruleVO.timestamp = timestampStyles[0].replace(/'/g, '\\\'');
          } else if (stringTimestampStyles.length !== 0 && this.selectedColumns.length === stringTimestampStyles.length && allEqual(stringTimestampStyles)) {
            this.ruleVO.timestamp = stringTimestampStyles[0].replace(/'/g, '\\\'');
          } else {
            this.ruleVO.timestamp = '';
          }
        }
      } else {
        this.isTypeTimestamp = false;
        this.ruleVO.timestamp = '';
      }
    } else if ('setformat' === this.ruleVO.command) {

      let selectedColumns = data.columns;
      let types = [];
      selectedColumns.forEach((item) => {
        let idx = this._findIndexWithNameInGridResponse(item);
        if ('TIMESTAMP' === this._findUpperCaseColumnTypeWithIdx(idx)) {
          types.push(this._findTimestampStyleWithIdxInColDescs(idx));
        } else {
          this.ruleVO.cols.splice(this.ruleVO.cols.indexOf(item), 1);
        }
        const allEqual = arr => arr.every(v => v === arr[0]);
        if (allEqual(types)) {
          this.ruleVO.timestamp = types[0];
        } else {
          this.ruleVO.timestamp = '';
        }
      });
      this.isTimestampEdit = false;
      this.ruleVO.timestamp = this.ruleVO.timestamp !== '' ? this.ruleVO.timestamp : this.ruleVO.timestamp.replace(/'/g, '\\\'');

    }

    if (this.selectedColumns.length === 0) {
      this.ruleVO.timestamp = '';
    }

    if (this.ruleVO.command === 'settype' || this.ruleVO.command === 'setformat') {
      this.getTimestampFormatsFromServer(this.selectedColumns);
    }
  } // function - setRuleInfoFromGridHeader


  /***
   * edit rule grid 에서 Header menu 선택시
   * @param args
   */
  public applyRuleFromGridHeaderMenu(args) {

    let rule = {};

    if (args.command === 'sort' || args.command === 'drop') {

      let val = '';

      if (args.command === 'drop') {
        val = ' col: ';
      } else {
        val = ' order: ';
      }

      rule = {
        command: args.command,
        col: args.column.id,
        op: 'APPEND',
        ruleString: args.command + val + args.column.id
      };

      this.applyRule(rule);

    } else if (args.command === 'sort_desc') {

      let val = ' order: ';
      this.ruleVO.type = 'desc';
      rule = {
        command: 'sort',
        col: args.column.id,
        op: 'APPEND',
        type: 'desc',
        ruleString: 'sort' + val + args.column.id + ' type:\'desc\''
      };

      this.applyRule(rule);

    } else {

      this.ruleVO['command'] = args.command;
      this.ruleVO.col = args.column.id;

      if (this.ruleVO['command'] === 'rename') {

        this.setDefaultValue(true);

        setTimeout(() => $('.newColumnInput').trigger('focus')); // 포커스
        // setTimeout(() => $('.newColumnInput').select()); // highlight

      } else if (this.ruleVO['command'] === 'settype') {

        setTimeout(() => $('[tabindex=3]').trigger('focus')); // 포커스

      }

    }

  } // function - applyRuleFromGridHeaderMenu

  /**
   * Context Menu Rule 적용 이벤트
   * @param data
   */
  public applyRuleFromContextMenu(data) {

    if (data.more) {
      this.ruleVO.command = data.more.command;
      this.safelyDetectChanges();
      switch (data.more.command) {
        case 'nest':
        case 'merge':
        case 'replace':
        case 'countpattern':
        case 'split':
        case 'extract':
        case 'rename':
          this._editRuleComp.init(this.selectedDataSet.gridData.fields, this.selectedDataSet.gridData.fields.filter( item => -1 < data.more.col.indexOf( item.name ) ));
          break;
        case 'unnest':
          let unnestList = this.selectedDataSet.gridData.fields.filter((item) => {
            return item.type === 'ARRAY' || item.type === 'MAP'
          });
          let selectedUnnestList =  this.selectedDataSet.gridData.fields.filter( item => -1 < data.more.col.indexOf( item.name ) ).filter((item) => {
            return item.type === 'ARRAY' || item.type === 'MAP'
          });
          this._editRuleComp.init(unnestList, selectedUnnestList);
          break;
        case 'setformat':
          let setformatList = this.selectedDataSet.gridData.fields.filter((item) => {
            return item.type === 'TIMESTAMP'
          });
          let setformatSel =  this.selectedDataSet.gridData.fields.filter( item => -1 < data.more.col.indexOf( item.name ) ).filter((item) => {
            return item.type === 'TIMESTAMP'
          });
          this._editRuleComp.init(setformatList, setformatSel, `dsId : ${this.selectedDataSet.dsId}`);
          break;
        case 'move':
          this._editRuleComp.init(this.selectedDataSet.gridData.fields, this.selectedDataSet.gridData.fields.filter( item => -1 < data.more.col.indexOf( item.name ) ), data.more.move);
          break;
        case 'set':
          this.ruleVO.cols = data.more.col;
          this._editRuleComp.setRuleVO(this.ruleVO);
          this._editRuleComp.init(this.selectedDataSet.gridData.fields, this.selectedDataSet.gridData.fields.filter( item => -1 < data.more.col.indexOf( item.name ) ));
          break;
        case 'derive':
          this._editRuleComp.setRuleVO(this.ruleVO);
          this._editRuleComp.init(this.selectedDataSet.gridData.fields, []);
          break;
        case 'settype':
          this.ruleVO.cols = data.more.col;
          // this._editRuleGridComp.selectColumn(this.ruleVO.col, true);
          this.ruleVO.type = data.more.type;
          this.isTypeTimestamp = true;

          if (this.ruleVO.type === 'String') { // 스트링일떄는 선택된 컬럼이 타임스탬프 타입임
            this.ruleVO.timestamp = this._findTimestampStyleWithIdxInColDescs(this._findIndexWithNameInGridResponse(this.ruleVO.col[0]));
          } else if (this.ruleVO.type === 'Timestamp') {
            let index = this._findIndexWithNameInGridResponse(data.more.col[0]);
            if (this._findUpperCaseColumnTypeWithIdx(index) === 'STRING') {
              this.dataflowService.getTimestampFormatSuggestions(this.selectedDataSet.dsId, { colNames: this.selectedDataSet.gridResponse.colNames })
                .then((result) => {

                  if (result[this.ruleVO.col][0]) {
                    this.ruleVO.timestamp = result[this.ruleVO.col][0].replace(/'/g, '\\\'');
                  }
                }).catch((error) => {
                console.info(error);
              });
            } else if (this._findUpperCaseColumnTypeWithIdx(index) === 'TIMESTAMP') {
              this.ruleVO.timestamp = this._findTimestampStyleWithIdxInColDescs(index);
            }
          }
          break;
      }
    } else {
      this.applyRule(data);
    }

  } // function - applyRuleFromContextMenu

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 타임스탬프 타입에 \' 를 \\' 로 바꾸야 하는지 ..
   * @param value
   */
  private _addBackSlashToQuote(value) {
    return value.replace(/'/g, '\\\'')
  } // function - addBackSlashToQuote


  /**
   * Find index of column Name in grid response
   * @param {string} name
   * @return {number}
   * @private
   */
  private _findIndexWithNameInGridResponse(name: string): number {
    return this.selectedDataSet.gridResponse.colNames.indexOf(name)
  } // function - _findIndexWithNameInGridResponse

  /**
   * Find timestamp style of timestamp type column
   * @param {number} idx
   * @return {string}
   * @private
   */
  private _findTimestampStyleWithIdxInColDescs(idx : number) : string {
    if (this.selectedDataSet.gridResponse.colDescs[idx].timestampStyle) {
      return this.selectedDataSet.gridResponse.colDescs[idx].timestampStyle.replace(/'/g, '\\\'');
    } else {
      return ''
    }

  } // function - _findTimestampStyleWithIdxInColDescs


  /**
   * Find type of column with idx ( upper cased)
   * @param {number} idx
   * @return {string}
   * @private
   */
  private _findUpperCaseColumnTypeWithIdx(idx: number): string {
    return this.selectedDataSet.gridResponse.colDescs[idx].type.toUpperCase()
  } // function - _findUpperCaseColumnTypeWithIdx


  /**
   * 룰 편집 정보 설정
   * @param {number} ruleIdx
   * @returns {Promise<any>}
   * @private
   */
  private _setEditRuleInfo(ruleIdx?: number): Promise<any> {
    this.loadingShow();

    this.isInitDataLoaded = true;
    this.safelyDetectChanges();

    return this._editRuleGridComp.init(this.selectedDataSet.dsId, ruleIdx)
      .then((data: { apiData: any, gridData: any }) => {
        const apiData = data.apiData;
        if (apiData.errorMsg) {
          this.loadingHide();
          Alert.warning(this.translateService.instant('msg.dp.alert.ds.retrieve.fail'));
        } else {

          this.currentIndex = apiData['ruleStringInfos'].length - 1;

          // Todo :
          let dsId = this.selectedDataSet.dsId;
          let dsName = this.selectedDataSet.dsName;
          let _embedded = this.selectedDataSet['_embedded'];

          this.selectedDataSet = apiData;

          // 서버에서 돌아오는 데이터에 dsId, dsName, embedded 없음
          this.selectedDataSet.dsId = dsId;
          this.selectedDataSet.dsName = dsName;
          this.selectedDataSet['_embedded'] = _embedded;

          this.selectedDataSet.gridData = data.gridData;

          // rule refresh
          this.setRuleList(apiData['ruleStringInfos']);

          // init ruleVO
          this.initRule(apiData);

          this.loadingHide();
        }

        return data;
      })
      .catch((error) => {
        this.loadingHide();
        let prep_error = this.dataprepExceptionHandler(error);
        PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
      });

  } // function - _setEditRuleInfo

  /**
   * 선택 필드 설정
   * @param {Field[]} fields
   * @param {string[]} selectColNames
   * @returns {Field[]}
   * @private
   */
  private _setSelectionFields(fields: any[], selectColNames: string[]): Field[] {
    fields.forEach(item => {
      const idx = selectColNames.findIndex(col => col === item.name);
      if (-1 < idx) {
        item.seq = idx + 1;
        item.selected = true;
        this._editRuleGridComp.selectColumn(item.name, true);
      } else {
        delete item.seq;
        delete item.selected;
      }
    });
    return fields;
  } // function - _setSelectionFields

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * Close selecbox or popup with esc
   */
  @HostListener('document:keydown.escape', ['$event'])
  private onKeydownHandler(event: KeyboardEvent) {
    if (event.keyCode === 27) {

      (this.isRuleUnionModalShow) && (this.ruleVO.command = '');
      (this.isRuleJoinModalShow) && (this.ruleVO.command = '');

      this.isRuleUnionModalShow = false;
      this.isRuleJoinModalShow = false;
      this.isColumnListShow = false;
      this.isTypeListShow = false;
      this.isMultiColumnListShow = false;
      this.isBeforeOrAfterShow = false;
      this.isBeforeOrAfterColumnListShow = false;
      this.isNestListShow = false;
      this.isCommandListShow = false;
      this.isUpdate = false;

      this.isAutoCompleteSuggestionListOpen = false;
      this.autoCompleteSuggestion_inputId = '';
      this.autoCompleteSuggestions = [];
      this.autoCompleteSuggestions_selectedIdx = -2;
    }
  }

  /**
   * apply rule with enter key
   */
  @HostListener('document:keydown.enter', ['$event'])
  private onEnterKeydownHandler(event: KeyboardEvent) {
    // enter key only works when there is not popup or selectbox opened

    let hasFocus = $('#gridSearch').is(':focus');

    if (event.keyCode === 13) {
      if (!this.isColumnListShow && !this.isTypeListShow && !this.isMultiColumnListShow
        && !this.isBeforeOrAfterShow
        && !this.isBeforeOrAfterColumnListShow && !this.isNestListShow && !this.isCommandListShow && !this.isTimestampOpen
        && !this.isRuleUnionModalShow && !this.isRuleJoinModalShow && this.step !== 'create-snapshot' && !hasFocus
        && this.autoCompleteSuggestions_selectedIdx == -1) {
        this.addRule();
      }
    }
  }

  /**
   * Set rule list
   */
  private setRuleList(rules: any) {
    this.ruleList = [];
    const commandNames = this.commandList.map((command) => {
      return command.command;
    });

    // ruleStringInfos
    rules.forEach((rule) => {
      rule['ruleVO'] = JSON.parse(rule['jsonRuleString']);
      rule['ruleVO']['command'] = rule['ruleVO']['name'];
      rule['ruleVO']['ruleNo'] = rule['ruleNo'];

      const idx = commandNames.indexOf(rule['ruleVO'].name);
      if (idx > -1) {
        rule['command'] = this.commandList[idx].command;
        rule['alias'] = this.commandList[idx].alias;
        rule['desc'] = this.commandList[idx].desc;
      }
      rule['simplifiedRule'] = this.simplifyRule(rule['ruleVO'], rule.ruleString);
      this.ruleList.push(rule);
    });
  }


  private initViewPage() {
    this.commandList = [
      {
        command: 'header',
        alias: 'He',
        desc: this.translateService.instant('msg.dp.li.he.description'),
        isHover: false
      },
      { command: 'keep', alias: 'Ke', desc: this.translateService.instant('msg.dp.li.ke.description'), isHover: false },
      {
        command: 'replace',
        alias: 'Rp',
        desc: this.translateService.instant('msg.dp.li.rp.description'),
        isHover: false
      },
      {
        command: 'rename',
        alias: 'Rn',
        desc: this.translateService.instant('msg.dp.li.rn.description'),
        isHover: false
      },
      { command: 'set', alias: 'Se', desc: this.translateService.instant('msg.dp.li.se.description'), isHover: false },
      {
        command: 'settype',
        alias: 'St',
        desc: this.translateService.instant('msg.dp.li.st.description'),
        isHover: false
      },
      {
        command: 'countpattern',
        alias: 'Co',
        desc: this.translateService.instant('msg.dp.li.co.description'),
        isHover: false
      },
      {
        command: 'split',
        alias: 'Sp',
        desc: this.translateService.instant('msg.dp.li.sp.description'),
        isHover: false
      },
      {
        command: 'derive',
        alias: 'Dr',
        desc: this.translateService.instant('msg.dp.li.dr.description'),
        isHover: false
      },
      {
        command: 'delete',
        alias: 'De',
        desc: this.translateService.instant('msg.dp.li.de.description'),
        isHover: false
      },
      { command: 'drop', alias: 'Dp', desc: this.translateService.instant('msg.dp.li.dp.description'), isHover: false },
      {
        command: 'pivot',
        alias: 'Pv',
        desc: this.translateService.instant('msg.dp.li.pv.description'),
        isHover: false
      },
      {
        command: 'unpivot',
        alias: 'Up',
        desc: this.translateService.instant('msg.dp.li.up.description'),
        isHover: false
      },
      { command: 'join', alias: 'Jo', desc: this.translateService.instant('msg.dp.li.jo.description'), isHover: false },
      {
        command: 'extract',
        alias: 'Ex',
        desc: this.translateService.instant('msg.dp.li.ex.description'),
        isHover: false
      },
      {
        command: 'flatten',
        alias: 'Fl',
        desc: this.translateService.instant('msg.dp.li.fl.description'),
        isHover: false
      },
      {
        command: 'merge',
        alias: 'Me',
        desc: this.translateService.instant('msg.dp.li.me.description'),
        isHover: false
      },
      { command: 'nest', alias: 'Ne', desc: this.translateService.instant('msg.dp.li.ne.description'), isHover: false },
      {
        command: 'unnest',
        alias: 'Un',
        desc: this.translateService.instant('msg.dp.li.un.description'),
        isHover: false
      },
      {
        command: 'aggregate',
        alias: 'Ag',
        desc: this.translateService.instant('msg.dp.li.ag.description'),
        isHover: false
      },
      { command: 'sort', alias: 'So', desc: this.translateService.instant('msg.dp.li.so.description'), isHover: false },
      { command: 'move', alias: 'Mv', desc: this.translateService.instant('msg.dp.li.mv.description'), isHover: false },
      {
        command: 'union',
        alias: 'Ui',
        desc: this.translateService.instant('msg.dp.li.ui.description'),
        isHover: false
      },
      { command: 'setformat', alias: 'Sf', desc: 'set timestamp type .... ', isHover: false }
    ];

    this.typeList = [
      { type: 'long', name: 'Long', isHover: false },
      { type: 'double', name: 'Double', isHover: false },
      { type: 'string', name: 'String', isHover: false },
      { type: 'boolean', name: 'Boolean', isHover: false },
      { type: 'timestamp', name: 'Timestamp', isHover: false }
    ];

    this.nestList = [
      { type: 'map', name: 'map', isHover: false },
      { type: 'array', name: 'array', isHover: false },
    ];

    this.moveList = [
      { type: 'before', name: 'before', isHover: false },
      { type: 'after', name: 'after', isHover: false }
    ];

    this.sortList = [
      { type: '', name: 'asc', isHover: false },
      { type: 'desc', name: 'desc', selected: false }
    ];

    // 룰 셋팅
    if (this.selectedDataSet.rules && this.selectedDataSet.rules.length > 0) {
      this.setRuleList(this.selectedDataSet.rules);
    }

    // init ruleVO
    this.ruleVO.command = '';

    // pivot formula input box 하나부터 시작
    this.pivotFormulaList.push('');

  }

  // noinspection JSMethodCanBeStatic
  private _validateSingleQuoteForPattern(on) {
    let pattern = StringUtil.checkSingleQuote(on, { isWrapQuote: !StringUtil.checkRegExp(on) });
    if (pattern[0] === false) {
      return;
    } else {
      return pattern[1]
    }

  }

  /**
   * apply rule
   * @rule Rule
   * @msg translate key
   * @isUndo
   */
  private applyRule(rule: object, msg?: string, isUndo?: boolean) {

    let command = rule['command'];

    // 현재 위치 저장
    this._editRuleGridComp.savePosition();

    this.loadingShow();
    this.dataflowService.applyRules(this.selectedDataSet.dsId, rule)
      .then((data) => {
        if (data.errorMsg) {
          Alert.warning(this.translateService.instant(msg ? msg : 'msg.dp.alert.apply.rule.fail'));
        } else {
          /*
                    // TODO : refresh here ?
                    this.selectedRows = [];
                    this.selectedDataSet.gridResponse = data.gridResponse;
                    this.selectedDataSet.ruleCurIdx = data.ruleCurIdx;
                    this.selectedDataSet.ruleStringInfos = data['ruleStringInfos'];
                    this.isJumped = false;
                    if (command === 'multipleRename') {
                      this.multicolumnRenameComponent.showFlag = false;
                    }
                    // 선택 초기화
                    this._editRuleGridComp.unSelectionAll('COL');
                    this.editColumnList = [];

                    // rule refresh
                    this.setRuleList(data['ruleStringInfos']);

                    // init ruleVO
                    this.initRule(data);

                    this.currentIndex = data['ruleStringInfos'].length - 1;

                    // grid refresh
                    this.selectedDataSet.gridData = this._editRuleGridComp.init(this.selectedDataSet.dsId, this.currentIndex);

                    if (data['ruleStringInfos'].length > 0) {
                      this._editRuleGridComp.setAffectedColumns(
                        data.gridResponse['interestedColNames'],
                        data.ruleStringInfos[data.ruleStringInfos.length - 1].command
                      );
                    }

                    if (command !== 'join' && command !== 'derive' && command !== 'aggregate' && command !== 'move') {
                      // 저장된 위치로 이동
                      this._editRuleGridComp.moveToSavedPosition();
                    }
                    // 계속 클릭하는거 방지ser
                    if (isUndo && this.isUndoRunning) {
                      this.isUndoRunning = false;
                    } else if (!isUndo && this.isRedoRunning) {
                      this.isRedoRunning = false;
                    }
          */
          this.selectedRows = [];
          this.isJumped = false;
          (command === 'multipleRename') && (this.multicolumnRenameComponent.showFlag = false);

          // 선택 초기화
          this._editRuleGridComp.unSelectionAll('COL');
          this.editColumnList = [];

          this._setEditRuleInfo(data.ruleCurIdx).then((data: { apiData: any, gridData: any }) => {

            if (data.apiData.ruleStringInfos.length > 0) {
              this._editRuleGridComp.setAffectedColumns(
                data.apiData.gridResponse['interestedColNames'],
                data.apiData.ruleStringInfos[data.apiData.ruleStringInfos.length - 1].command
              );
            }

            if (command !== 'join' && command !== 'derive' && command !== 'aggregate' && command !== 'move') {
              // 저장된 위치로 이동
              this._editRuleGridComp.moveToSavedPosition();
            }
            // 계속 클릭하는거 방지
            if (isUndo && this.isUndoRunning) {
              this.isUndoRunning = false;
            } else if (!isUndo && this.isRedoRunning) {
              this.isRedoRunning = false;
            }

          });

        }


        this.changeDetect.detectChanges();

        // this.loadingHide();

      })
      .catch((error) => {

        console.error(error);

        this.loadingHide();

        // If error, remove single quotes from input
        this.removeQuotes(this.ruleVO);

        if (isNull(error)) {
          return;
        }

        let prep_error = this.dataprepExceptionHandler(error);
        PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));

        if (prep_error.code && prep_error.code.startsWith('PR')) {
        } else if (1 < this.inputRuleCmd.length) {
          Alert.warning(this.translateService.instant('msg.dp.alert.command.error'));
        } else {
          Alert.error(this.translateService.instant('msg.dp.alert.unknown.error'));
        }
      });

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Set return value for each rule .. 22 rules..
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  private setSetformatRule() {
    // 컬럼
    if (this.ruleVO.cols.length === 0) {
      Alert.warning(this.translateService.instant('msg.dp.alert.sel.col'));
      return;
    }
    this.ruleVO.col = this.ruleVO.cols.join(', ');

    if (this.ruleVO.timestamp !== '' || !isUndefined(this.ruleVO.timestamp)) {

      if (!this._surroundQuoteOnTimestamp(this.ruleVO.timestamp === 'Custom format' ? this.timestampVal : this.ruleVO.timestamp)) {
        return;
      }
    }
    return {
      command: this.ruleVO.command,
      ruleString: PreparationCommonUtil.makeRuleResult(this.ruleVO)
    }
  }

  private setSettypeRule(): any {

    // 컬럼
    if (this.ruleVO.cols.length === 0) {
      Alert.warning(this.translateService.instant('msg.dp.alert.sel.col'));
      return;
    }
    this.ruleVO.col = this.ruleVO.cols.join(', ');

    // 타임스템프
    if (this.isTypeTimestamp) {
      if ('Timestamp' === this.ruleVO.type) {

        if (!this._surroundQuoteOnTimestamp(this.ruleVO.timestamp === 'Custom format' ? this.timestampVal : this.ruleVO.timestamp)) {
          return;
        }

      } else if ('String' === this.ruleVO.type) {

        if (this.ruleVO.timestamp === '' || isUndefined(this.ruleVO.timestamp) || (this.ruleVO.timestamp === 'Custom format' && this.timestampVal === '')) {

          this.ruleVO.timestamp = ''

        } else if ((this.ruleVO.timestamp !== 'Custom format' && this.timestampVal === '') || (this.ruleVO.timestamp === 'Custom format' && this.timestampVal !== '')) {

          if (!this._surroundQuoteOnTimestamp(this.timestampVal !== '' ? this.timestampVal : this.ruleVO.timestamp)) {
            return;
          }

        }
      }
    }

    // 타입
    if (isUndefined(this.ruleVO.type) || '' === this.ruleVO.type) {
      Alert.warning(this.translateService.instant('msg.dp.alert.sel.type'));
      return;
    }
    return {
      command: this.ruleVO.command,
      ruleString: PreparationCommonUtil.makeRuleResult(this.ruleVO)
    };

  } // function - setSettypeRule

  /**
   * 타임스탬프 값에 '로 감싼다
   * @param {string} value
   * @return {boolean}
   * @private
   */
  private _surroundQuoteOnTimestamp(value: string): boolean {
    let check = StringUtil.checkSingleQuote(value, { isPairQuote: false, isWrapQuote: true });
    if (check[0] === false) {
      Alert.warning(this.translateService.instant('msg.dp.alert.invalid.timestamp.val'));
      return false;
    } else {
      this.ruleVO.timestamp = check[1];
      return true;
    }
  } // - _surroundQuoteOnTimestamp

  private setPivotRule(): any {

    // 컬럼
    if (this.ruleVO.cols.length === 0) {
      Alert.warning(this.translateService.instant('msg.dp.alert.sel.col'));
      return;
    }
    this.ruleVO.col = this.ruleVO.cols.join(', ');

    // Formula
    // must enter at least one formula
    if (this.pivotFormulaValueList.length === 0) {
      Alert.warning(this.translateService.instant('msg.dp.alert.insert.formula'));
      return;
    }
    let checkFormula = this.pivotFormulaValueList.map((field) => {
      return StringUtil.checkSingleQuote(field, { isWrapQuote: false, isAllowBlank: false })[0];
    });
    if (checkFormula.indexOf(false) == -1) {
      this.pivotFormulaValueList = this.pivotFormulaValueList.map((field) => { // 수식 하나에 ''를 감싼다
        if (StringUtil.checkFormula(field)) {
          return '\'' + field + '\'';
        } else {
          Alert.warning(this.translateService.instant('msg.dp.alert.check.formula'));
          return;
        }
      });
      this.ruleVO.value = this.pivotFormulaValueList.join(','); // 수식을 , 로 쪼인한다
    } else {
      Alert.warning(this.translateService.instant('msg.dp.alert.check.formula'));
      return;
    }

    // 그룹
    if (this.ruleVO.groups.length === 0) {
      Alert.warning(this.translateService.instant('msg.dp.alert.enter.groupby'));
      return;
    }
    this.ruleVO.group = this.ruleVO.groups.join(', ');

    return {
      ruleString: PreparationCommonUtil.makeRuleResult(this.ruleVO)
    };

  } // function - setPivotRule

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Set edit info for each rule .. 20 rules..
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private setSettypEditInfo(rule) {
    this.getEditColumnList(rule['jsonRuleString'], 'col');

    let ruleString = JSON.parse(rule['jsonRuleString']);
    if (ruleString['format']) {
      let str = rule.ruleString.split('format: ');
      str = str[1].substring(1, str[1].length - 1);
      this.isTypeTimestamp = true;
      let items = this.timestampTime.map((item) => {
        return item.value;
      });
      if (items.indexOf(str) === -1) {
        this.ruleVO.timestamp = 'Custom format';
        this.timestampVal = str;
      } else {
        this.ruleVO.timestamp = items[items.indexOf(str)];
      }
    }

  }

  private setPivotEditInfo(rule) {
    let pivotrulestring = JSON.parse(rule['jsonRuleString']);
    this.selectedDataSet.gridData.fields.filter((field) => {
      delete field.seq;
      delete field.groupSeq;
    });

    if (pivotrulestring['value']['escapedValue']) {
      this.pivotFormulaValueList[0] = pivotrulestring['value']['escapedValue'];
    } else {
      pivotrulestring['value']['value'].filter((item) => {
        const field = item.substring(1, item.length - 1);
        this.pivotFormulaValueList.push(field);
      });

    }

    this.pivotFormulaList.length = this.pivotFormulaValueList.length;

    if (!isUndefined(pivotrulestring['col'].value)) {
      const pivotFields = this.selectedDataSet.gridData.fields.map((f) => {
        return f.name;
      });
      // this.ruleVO.cols = [];
      this.ruleVO.groups = [];

      if (pivotrulestring['group']) {

        if (typeof pivotrulestring['group'].value === 'string') {
          pivotrulestring['group']['value'] = [pivotrulestring['group'].value];
        }

        pivotrulestring['group']['value'].forEach((colName, index) => {
          this.ruleVO.groups.push(colName);
          const idx = pivotFields.indexOf(colName);
          if (idx > -1) {
            // only insert seq number into selected fields
            this.selectedDataSet.gridData.fields[idx].ticked = true;
            this.selectedDataSet.gridData.fields[idx].groupSeq = index + 1;
          }
        });
      }
    }

    this.getEditColumnList(rule['jsonRuleString'], 'col');
  }

  private setJoinEditInfo(rule) {
    this.rightDataset = new Dataset();

    // is it append or update ?
    this.rightDataset.joinButtonText = 'Edit Join';

    // 수정시 필요한 룰넘버
    this.rightDataset.ruleNo = rule['ruleNo'];

    // dataset id
    this.rightDataset.dsId = this.ruleVO['dataset2']['escapedValue'];

    //  join type
    this.rightDataset.selectedJoinType = this.ruleVO['joinType'].substring(1, this.ruleVO['joinType'].length - 1);

    let rlist = []; // container for rightcolumns
    let llist = []; // container for leftcolumns
    typeof this.ruleVO['rightSelectCol'].value === 'string' ? (rlist[0] = this.ruleVO['rightSelectCol'].value)
      : this.rightDataset.rightSelectCol = this.ruleVO['rightSelectCol'].value;
    typeof this.ruleVO['leftSelectCol'].value === 'string' ? (llist[0] = this.ruleVO['leftSelectCol'].value)
      : this.rightDataset.leftSelectCol = this.ruleVO['leftSelectCol'].value;

    rlist.length > 0 ? this.rightDataset.rightSelectCol = rlist : null;
    llist.length > 0 ? this.rightDataset.leftSelectCol = llist : null;
    let list = [];

    if (this.ruleVO['condition'].hasOwnProperty('children')) {
      list = this.ruleVO['condition']['children'];
      this.rightDataset.joinRuleList = [];
      list.forEach((item) => {
        const info = new JoinInfo();
        info.leftJoinKey = item['left'].value;
        info.rightJoinKey = item['right'].value;
        this.rightDataset.joinRuleList.push(info);

      });
    } else {

      list = this.ruleVO['condition'];
      this.rightDataset.joinRuleList = [];
      const info = new JoinInfo();
      info.leftJoinKey = list['left'].value;
      info.rightJoinKey = list['right'].value;
      this.rightDataset.joinRuleList.push(info);
    }

    this.isRuleJoinModalShow = true;
    this.changeDetect.detectChanges();
  }

  /**
   * Multi column edit - 어떤 컬럼이 선택 되어있는지
   * @param jsonRuleString
   * @param property
   */
  private getEditColumnList(jsonRuleString, property) {
    let ruleString = JSON.parse(jsonRuleString);

    if (!isUndefined(ruleString[property].value)) {
      this.editColumnList = [];

      if (typeof ruleString[property].value === 'string') {
        this.editColumnList[0] = ruleString[property].value;
        return;
      }

      ruleString[property]['value'].forEach((colName) => {
        this.editColumnList.push(colName);
      });
    }
  }

  /**
   * Remove surrounded quotation marks from server
   * @param property
   */
  private removeQuotation(property) {
    if ('string' !== typeof this.ruleVO[property]) {
      this.ruleVO[property] = this.ruleVO[property]['escapedValue'];
    } else {
      if (this.ruleVO[property].startsWith('\'') && this.ruleVO[property].endsWith('\'')) {
        this.ruleVO[property] = this.ruleVO[property].substring(1, this.ruleVO[property].length - 1);
      }
    }

  }

  /**
   * Rule 변경
   * @param $event
   * @returns {boolean}
   */
  public changeRule($event) {
    if (-2 == this.autoCompleteSuggestions_selectedIdx) {
      this.autoCompleteSuggestions_selectedIdx = -1;
      return;
    }

    //console.log($event);

    let inputId = '';
    let value = undefined;
    if (typeof $event === 'string') {
      value = $event;
    } else {
      if ($event.target && $event.target.value) {
        value = $event.target.value.substring(0, $event.target.selectionStart);
        if ($event.key) {
          if (
            (8 <= $event.keyCode && $event.keyCode <= 9) ||
            (12 <= $event.keyCode && $event.keyCode <= 13) ||
            (16 <= $event.keyCode && $event.keyCode <= 21) ||
            $event.keyCode === 25 ||
            $event.keyCode === 27 ||
            (33 <= $event.keyCode && $event.keyCode <= 47) ||
            (91 <= $event.keyCode && $event.keyCode <= 92) ||
            (112 <= $event.keyCode && $event.keyCode <= 127) ||
            (144 <= $event.keyCode && $event.keyCode <= 145)
          ) {
            // special key
          } else {
            if (($event.metaKey == true || $event.ctrlKey == true) && $event.key == 'v') {
              // paste
              /*
              let input = $event.target;
              input.blur();
              input.focus();
              */
              return;
            } else {
              value += $event.key;
            }
          }
        }
      }
      if ($event.target && $event.target.id) {
        inputId = $event.target.id;
      }
      if (this.autoCompleteSuggestions && 0 < this.autoCompleteSuggestions.length) {
        if ($event.keyCode === 38 || $event.keyCode === 40) {
          if ($event.keyCode === 38) {
            this.autoCompleteSuggestions_selectedIdx--;
          } else if ($event.keyCode === 40) {
            this.autoCompleteSuggestions_selectedIdx++;
          }

          if (this.autoCompleteSuggestions_selectedIdx < 0) {
            this.autoCompleteSuggestions_selectedIdx = this.autoCompleteSuggestions.length - 1;
          } else if (this.autoCompleteSuggestions.length <= this.autoCompleteSuggestions_selectedIdx) {
            this.autoCompleteSuggestions_selectedIdx = 0;
          }

          let height = 25;
          $('.ddp-list-command').scrollTop(this.autoCompleteSuggestions_selectedIdx * height);

          return false;
        } else if ($event.keyCode === 27) {
          this.isAutoCompleteSuggestionListOpen = false;
          this.autoCompleteSuggestion_inputId = '';
          this.autoCompleteSuggestions = [];
          this.autoCompleteSuggestions_selectedIdx = -2;
          return false;
        } else if ($event.keyCode === 13 || $event.keyCode === 108) {
          if (0 <= this.autoCompleteSuggestions_selectedIdx
            && this.autoCompleteSuggestions_selectedIdx < this.autoCompleteSuggestions.length) {
            if (inputId.startsWith('rule-pivot') || inputId.startsWith('rule-aggregate')) {
              let formulaValueIdx = inputId.substring(inputId.lastIndexOf('-') + 1);
              this.onautoCompleteSuggestionsSelectPivot(this.autoCompleteSuggestions[this.autoCompleteSuggestions_selectedIdx], this.pivotFormulaValueList, formulaValueIdx);
            } else {
              this.onautoCompleteSuggestionsSelect(this.autoCompleteSuggestions[this.autoCompleteSuggestions_selectedIdx]);
            }
          }
          return false;
        } else if ($event.keyCode === 8 || $event.keyCode === 46 || $event.keyCode === 37 || $event.keyCode === 39) {

          let input = $event.target;
          let input_value = input.value;
          let start = input.selectionStart;
          let end = input.selectionEnd;

          if ($event.keyCode === 8) {
            if (0 <= start && end <= input_value.length) {
              if (start == end) {
                start--;
                end--;
                input_value = input_value.substring(0, start) + input_value.substring(start + 1);
              } else if (start < end) {
                input_value = input_value.substring(0, start) + input_value.substring(end);
                end = start;
              }
            }
          } else if ($event.keyCode === 46) {
            if (0 <= start && end <= input_value.length) {
              if (start == end) {
                input_value = input_value.substring(0, start + 1) + input_value.substring(end + 2);
              } else if (start < end) {
                input_value = input_value.substring(0, start) + input_value.substring(end);
                end = start;
              }
            }
          } else if ($event.keyCode === 37) {
            if (0 < start) {
              start--;
              end--;
            }
          } else if ($event.keyCode === 39) {
            if (end < input_value.length) {
              start++;
              end++;
            }
          }

          input.blur();

          input.value = input_value;
          input.selectionStart = start;
          input.selectionEnd = end;

          input.dispatchEvent(new Event('input'));
          input.focus();

          return false;
        } else if (
          (8 <= $event.keyCode && $event.keyCode <= 9) ||
          (12 <= $event.keyCode && $event.keyCode <= 13) ||
          (16 <= $event.keyCode && $event.keyCode <= 21) ||
          $event.keyCode === 25 ||
          $event.keyCode === 27 ||
          (33 <= $event.keyCode && $event.keyCode <= 47) ||
          (91 <= $event.keyCode && $event.keyCode <= 92) ||
          (112 <= $event.keyCode && $event.keyCode <= 127) ||
          (144 <= $event.keyCode && $event.keyCode <= 145)
        ) {
          return false;
        } else {
          // normal character
        }
      }
    }

    let ruleString = '';
    let ruleCommand = null;
    let rulePart = null;
    if (!isUndefined(this.ruleVO)) {
      ruleString = PreparationCommonUtil.makeRuleResult(this.ruleVO);
      ruleCommand = this.ruleVO['command'];
      if (undefined !== value) {
        rulePart = value;
        if (0 < rulePart.length && 0 < this.autoCompleteSuggestions.length) {
          for (let suggest of this.autoCompleteSuggestions) {
            if (rulePart.trim().endsWith(suggest.value)) {
              if (suggest.type != '@_OPERATOR_@'
                && suggest.type != '@_STRING_@'
                && suggest.type != '@_FUNCTION_EXPRESSION_@'
                && suggest.type != '@_AGGREGATE_FUNCTION_EXPRESSION_@') {
                let lastIdx = rulePart.lastIndexOf(suggest.value);
                rulePart = rulePart.substring(0, lastIdx) + suggest.type + rulePart.substring(lastIdx + suggest.value.length);
              }
              break;
            }
          }
        }
      } else {
        rulePart = '';
      }
    }

    /********************************
     // autocomplete temporary dev
     *********************************/
    /*
    let columnNames = [];
    if(ruleCommand=='set' && 0<this.selectedDataSet.gridData.fields.length ) {
      columnNames.push( '$col' );
    }
    for(var _column of this.selectedDataSet.gridData.fields) {
      columnNames.push( _column.name );
    }
    var functionNames = [
      'add_time', 'concat', 'concat_ws', 'day', 'hour', 'if', 'isnan', 'isnull', 'length', 'lower', 'ltrim', 'math.abs', 'math.acos', 'math.asin', 'math.atan', 'math.cbrt', 'math.ceil', 'math.cos', 'math.cosh', 'math.exp', 'math.expm1', 'math.getExponent', 'math.round', 'math.signum', 'math.sin', 'math.sinh', 'math.sqrt', 'math.tan', 'math.tanh', 'millisecond', 'minute', 'month', 'now', 'rtrim', 'second', 'substring', 'time_diff', 'timestamp', 'trim', 'upper','year'
    ];
    var functionAggrNames = [
      'sum','avg','max','min','count',
    ];
    console.log(value);
    */


    this.dataflowService.autoComplete(ruleString, ruleCommand, rulePart).then((data) => {
      let columnNames = [];
      if (ruleCommand == 'set' && 0 < this.selectedDataSet.gridData.fields.length) {
        columnNames.push('$col');
      }
      for (let _column of this.selectedDataSet.gridData.fields) {
        columnNames.push(_column.name);
      }
      let functionNames = [
        'add_time', 'concat', 'concat_ws', 'day', 'hour', 'if', 'isnan', 'isnull', 'length', 'lower', 'ltrim', 'math.abs', 'math.acos', 'math.asin', 'math.atan', 'math.cbrt', 'math.ceil', 'math.cos', 'math.cosh', 'math.exp', 'math.expm1', 'math.getExponent', 'math.round', 'math.signum', 'math.sin', 'math.sinh', 'math.sqrt', 'math.tan', 'math.tanh', 'millisecond', 'minute', 'month', 'now', 'rtrim', 'second', 'substring', 'time_diff', 'timestamp', 'trim', 'upper', 'year'
      ];
      // 2018.5.23  'now','month','day','hour','minute','second','millisecond','if','isnull','isnan','length','trim','ltrim','rtrim','upper','lower','substring','math.abs','math.acos','math.asin','math.atan','math.cbrt','math.ceil','math.cos','math.cosh','math.exp','math.expm1','math.getExponent','math.round','math.signum','math.sin','math.sinh','math.sqrt','math.tan','math.tanh','left','right','if','substring','add_time','concat','concat_ws'
      let functionAggrNames = [
        'sum', 'avg', 'max', 'min', 'count',
      ];
      if (!isUndefined(data.suggest)) {
        let suggests: any = [];
        let ruleSource = '';
        let tokenSource0 = data.suggest[0].tokenSource;
        data.suggest.forEach((item) => {
          if (0 <= item.start) {
            if (item.tokenSource == '<EOF>') {
              item.tokenSource = '';
            }
            if (1 < item.tokenString.length && item.tokenString.startsWith('\'') && item.tokenString.endsWith('\'')) {
              item.tokenString = item.tokenString.substring(1, item.tokenString.length - 1);
            }
            if (item.tokenString == '@_COLUMN_NAME_@') {
              let ts = item.tokenSource;
              if (false == tokenSource0.endsWith(ts)) {
                ts = '';
              }
              for (let columnName of columnNames) {
                if (columnName.startsWith(ts)) {
                  let suggest = {
                    'type': item.tokenString,
                    'class': 'DodgerBlue',
                    'source': item.tokenSource,
                    'value': columnName
                  };
                  suggests.push(suggest);
                }
              }
            } else if (item.tokenString == '@_FUNCTION_EXPRESSION_@') {
              let ts = item.tokenSource;
              if (false == tokenSource0.endsWith(ts)) {
                ts = '';
              }
              for (let functionName of functionNames) {
                if (functionName.startsWith(ts)) {
                  let suggest = {
                    'type': item.tokenString,
                    'class': 'Olive',
                    'source': item.tokenSource,
                    'value': functionName
                  };
                  suggests.push(suggest);
                }
              }
            } else if (item.tokenString == '@_COMPLETED_BRACKET_@') {
              let openidx = ruleSource.lastIndexOf('(');
              let closeidx = ruleSource.lastIndexOf(')');
              if (0 <= openidx && closeidx < openidx) {
                //if( item.tokenSource.startsWith('(') ) {
                let suggest = {
                  'type': item.tokenString,
                  'class': 'LightCoral',
                  'source': item.tokenSource,
                  'value': ')'
                };
                suggests.push(suggest);
              }
            } else if (item.tokenString == '@_STRING_@') {
              if (item.tokenSource.startsWith('\'')) {
                let suggest = {
                  'type': item.tokenString,
                  'class': 'black',
                  'source': item.tokenSource,
                  'value': '\''
                };
                suggests.push(suggest);
              }
            } else if (item.tokenString == 'LONG') {
            } else if (item.tokenString == 'DOUBLE') {
            } else if (item.tokenString == 'BOOLEAN') {
            } else if (item.tokenString == '@_AGGREGATE_FUNCTION_EXPRESSION_@') {
              for (let functionName of functionAggrNames) {
                if (functionName.startsWith(item.tokenSource)) {
                  let suggest = {
                    'type': item.tokenString,
                    'class': 'Olive',
                    'source': item.tokenSource,
                    'value': functionName
                  };
                  suggests.push(suggest);
                }
              }
            } else if (item.tokenString == 'count' || item.tokenString == 'avg' || item.tokenString == 'sum' || item.tokenString == 'min' || item.tokenString == 'max') {
              if (item.tokenString.startsWith(item.tokenSource)) {
                let suggest = {
                  'type': '@_AGGREGATE_FUNCTION_EXPRESSION_@', // item.tokenString,
                  'class': 'Olive',
                  'source': item.tokenSource,
                  'value': item.tokenString
                };
                suggests.push(suggest);
              }
            } else {
              let suggest = {
                'type': '@_OPERATOR_@',
                'class': 'LightCoral',
                'source': item.tokenSource,
                'value': item.tokenString
              };

              // column name for aggregate function
              if (suggest.value == ')' &&
                (tokenSource0.startsWith('sum') || tokenSource0.startsWith('avg') || tokenSource0.startsWith('min') || tokenSource0.startsWith('max'))
              ) {
                let colnameIdx = tokenSource0.lastIndexOf('(');
                let ts = tokenSource0.substring(colnameIdx + 1);
                for (let columnName of columnNames) {
                  if (columnName.startsWith(ts)) {
                    let suggest = {
                      'type': '@_COLUMN_NAME_@',
                      'class': 'DodgerBlue',
                      'source': item.tokenSource,
                      'value': columnName
                    };
                    suggests.push(suggest);
                  }
                }
              }
              if (suggest.value != '(' && suggest.value != ')') {
                suggests.push(suggest);
              }
            }
          } else if (-1 == item.start && -1 == item.stop && -1 == item.tokenNum) {
            ruleSource = item.tokenSource;
          }
        });
        this.autoCompleteSuggestions_selectedIdx = -1;
        this.autoCompleteSuggestions = suggests;
        if (0 <= suggests.length) {
          this.isAutoCompleteSuggestionListOpen = true;
          this.autoCompleteSuggestion_inputId = inputId;
        } else {
          this.isAutoCompleteSuggestionListOpen = false;
          this.autoCompleteSuggestion_inputId = '';
        }
      }
    }).catch((error) => {
      this.isAutoCompleteSuggestionListOpen = false;
      this.autoCompleteSuggestion_inputId = '';
      this.autoCompleteSuggestions_selectedIdx = -1;
      this.autoCompleteSuggestions = [];

      let prep_error = this.dataprepExceptionHandler(error);
      PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
    });
  } // function - changeRule

  public onautoCompleteSuggestionsSelect(item) {
    /*
    let value = null;
    switch (this.ruleVO.command) {
      case 'keep':
      case 'delete':
        value = this.ruleVO.row;
        break;
      case 'set' :
      case 'derive' :
        value = this.ruleVO.value;
        break;
    }
    if(isUndefined(value)) {
      value = "";
    }

    if( item.type!="@_OPERATOR_@" && item.type!="@_FUNCTION_EXPRESSION_@" ) {
      let lastIdx = value.lastIndexOf(item.source);
      if(-1!=lastIdx && value.endsWith(item.source) ) {
          value = value.substring(0,lastIdx) + item.value;
      } else {
          value += item.value;
      }
    } else {
      value += item.value;
    }

    switch (this.ruleVO.command) {
      case 'keep':
      case 'delete':
        this.ruleVO.row = value;
        break;
      case 'set' :
      case 'derive' :
        this.ruleVO.value = value;
        break;
    }

    this.changeRule(value);
    */

    let input = this.elementRef.nativeElement.querySelector('#' + this.autoCompleteSuggestion_inputId);
    if (isUndefined(input)) {
      return;
    }

    let start = input.selectionStart;
    let end = input.selectionEnd;
    let value = input.value.substring(0, input.selectionStart);
    if (item.type != '@_OPERATOR_@') { // && item.type!="@_FUNCTION_EXPRESSION_@" ) {
      if (start < end) {
        value = input.value.substring(0, input.selectionEnd);
      }
      let lastIdx = value.lastIndexOf(item.source);
      if (-1 != lastIdx && value.endsWith(item.source)) {
        value = value.substring(0, lastIdx);
      }
    }

    let len_of_head = value.length;
    value += item.value;
    let caretPos = value.length;
    let tail = input.value.substring(input.selectionEnd);
    if (start == end && len_of_head <= start) {
      let part_of_tail = value.substring(start);
      if (tail.indexOf(part_of_tail) == 0) {
        tail = tail.substring(part_of_tail.length);
      }
    }
    value += tail;

    input.blur();

    input.value = value;
    input.selectionStart = caretPos;
    input.selectionEnd = caretPos;

    input.focus();
  }

  public isAutoCompleteSuggestionListOpenPivot(id, idx) {
    return (true == this.isAutoCompleteSuggestionListOpen && this.autoCompleteSuggestion_inputId == id + '-' + idx);
  }

  public onautoCompleteSuggestionsSelectPivot(item, pivotFormulaValueList, idx) {
    let input = this.elementRef.nativeElement.querySelector('#' + this.autoCompleteSuggestion_inputId);
    if (isUndefined(input)) {
      return;
    }

    let value = input.value.substring(0, input.selectionStart);

    if (item.type == '@_AGGREGATE_FUNCTION_EXPRESSION_@') {
      value = item.value;
    } else if (item.type == '@_COLUMN_NAME_@') {
      let bracketIdx = value.lastIndexOf('(');
      value = value.substring(0, bracketIdx);
      let colname = value.substring(bracketIdx + 1);
      if (item.value.startsWith(colname)) {
        value += '(';
      } else {
        value += '(' + colname;
      }
      value += item.value;
    } else if (item.type == '@_OPERATOR_@') {
      value += item.value;
    }

    pivotFormulaValueList[idx] = value;
    let caretPos = value.length;

    input.blur();

    input.value = value;
    input.selectionStart = caretPos;
    input.selectionEnd = caretPos;

    input.focus();
  }

}

class JoinInfo {
  public leftJoinKey: string;
  public rightJoinKey: string;
}
