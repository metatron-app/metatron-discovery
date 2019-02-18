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

import { isNullOrUndefined, isUndefined } from 'util';
import * as $ from 'jquery';
import * as _ from 'lodash';
import {
  AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Injector, Input, OnDestroy, OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { PrDataflow } from '../../../../../domain/data-preparation/pr-dataflow';
import { PrDataset, Field, Rule } from '../../../../../domain/data-preparation/pr-dataset';
import { StringUtil } from '../../../../../common/util/string.util';
import { Alert } from '../../../../../common/util/alert.util';
import { PreparationAlert } from '../../../../util/preparation-alert.util';
import { AbstractPopupComponent } from '../../../../../common/component/abstract-popup.component';
import { DataflowService } from '../../../service/dataflow.service';
import { MulticolumnRenameComponent } from './multicolumn-rename.component';
import { ExtendInputFormulaComponent } from './extend-input-formula.component';
import { EditRuleGridComponent } from './edit-rule-grid/edit-rule-grid.component';
import { EditRuleComponent } from './edit-rule/edit-rule.component';
import { CreateSnapshotPopup } from '../../../../component/create-snapshot-popup.component';
import { RuleListComponent } from './rule-list.component';
import { DataSnapshotDetailComponent } from '../../../../data-snapshot/data-snapshot-detail.component';
import { EventBroadcaster } from '../../../../../common/event/event.broadcaster';
import {PreparationCommonUtil} from "../../../../util/preparation-common.util";
import {MultipleRenamePopupComponent} from "./multiple-rename-popup.component";

declare let Split;

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

  @ViewChild(MultipleRenamePopupComponent)
  private multipleRenamePopupComponent: MultipleRenamePopupComponent;

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

  private _split: any;

  private _isExecAddRule:boolean = false;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public isInitDataLoaded: boolean = false;

  @Input()
  //public dataflow: Dataflow;
  public dataflow: PrDataflow;

  @Input()
  //public selectedDataSet: Dataset;
  public selectedDataSet: PrDataset;

  @Output()
  public closeEditRule = new EventEmitter();

  @Output()
  //public changeDataset = new EventEmitter<Dataset>();
  public changeDataset = new EventEmitter<PrDataset>();

  @Input()
  public step: string;

  // 검색어
  public commandSearchText: string = '';

  // 조인 편집시 필요한 데이터
  //public rightDataset: Dataset;
  public rightDataset: PrDataset;

  // Layer show/hide
  public isMultiColumnListShow: boolean = false;
  public isRuleJoinModalShow: boolean = false;
  public isRuleUnionModalShow: boolean = false;
  public isOtherDatasetListShow: boolean = false;
  public isCommandListShow: boolean = false;

  // Rules
  public ruleVO: Rule = new Rule();
  public ruleList: any[] = [];
  public isJumped: boolean = false;
  public redoable: boolean = false;
  public undoable: boolean = false;

  // Flag for undo and redo, to stop users from multiple requests
  public isRedoRunning: boolean = false;
  public isUndoRunning: boolean = false;

  // Add rule / editor or builder
  public editorUseFlag: boolean = false;
  public editorUseLabel: string = this.translateService.instant('msg.dp.btn.switch.editor');

  // input cmd line
  public inputRuleCmd: string = ''; // Rule을 직접 입력시

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
  public editColumnList = [];                 // 수정 할 컬럼 리스트
  public selectedColumns: string[] = [];     // 그리드에서 선택된 컬럼 리스트
  public selectedRows: any = [];             // 그리드에서 선택된 로우 리스트

  // tell if union is updating or just adding
  public isUpdate: boolean = false;

  // select box 에서 선택됐는지 여부
  public selectboxFlag: boolean = false;

  // Histogram
  public charts: any = [];

  // 현재 서버와 맞는 index
  public serverSyncIndex: number;

  // APPEND (룰 등록) / UPDATE (룰 수정) / JUMP / PREPARE_UPDATE (룰 수정하기 위해 jump) / DELETE
  public opString: string = 'APPEND';

  public isEnterKeyPressedFromOuter: boolean = false;

  public isAggregationIncluded: boolean = false;

  get filteredWrangledDatasets() {
    if (this.dataflow.datasets.length === 0) return [];

    let list = this.dataflow.datasets;

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

    const isSearchTextEmpty = StringUtil.isNotEmpty(this.commandSearchText);

    let enCheckReg = /^[A-Za-z]+$/;

    // Check Search Text
    if (isSearchTextEmpty) {
      commandList = commandList.filter((item) => {
        // language(en or ko) check
        if(enCheckReg.test(this.commandSearchText)) {
          return item.command.toLowerCase().indexOf(this.commandSearchText.toLowerCase()) > -1;
        } else {
          return item.command_h.some(v=> v.indexOf(this.commandSearchText) > -1 );
        }
      });
    }
    return commandList;

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private dataflowService: DataflowService,
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

        if (data.id === 'toggleList') {
          this.isMultiColumnListShow = data.isShow;
        } else if(data.id === 'enterKey') {
          this.isEnterKeyPressedFromOuter = true;
        } else {
          this.isMultiColumnListShow = data.isShow;
          this.isCommandListShow = false;
        }

      })
    );

    this.initViewPage();

  }

  public ngOnChanges() {}

  public ngAfterViewInit() {
    this._split = [];
    this._split.push(Split(['.rule-left', '.rule-right'], {
        sizes: [80, 20],
      minSize: [300, 300],
        onDragEnd: (() => {
          this._editRuleGridComp.resizeGrid();
        }),
        onDragStart: (() => {
          this._editRuleGridComp.gridAllContextClose();
        })
      })
    );
    this._split.push(Split(['.rule-top', '.rule-bottom'], {
      direction: 'vertical',
      sizes: [75, 25],
      minSize: [400, 110],
      onDragEnd: (() => {
        this._editRuleGridComp.resizeGrid();
      }),
      onDragStart: (() => {
        this._editRuleGridComp.gridAllContextClose();
      })
    }));
    this._setEditRuleInfo({op:'INITIAL', ruleIdx: null, count: 100, offset: 0}).then((data)=> {

      if (data['error']) {
        let prep_error = this.dataprepExceptionHandler(data['error']);
        PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
        return;
      }

      this.serverSyncIndex = data.apiData.ruleCurIdx;
      this.ruleListComponent.selectedRuleIdx = this.serverSyncIndex; // 처음 들어갔을 때 전에 jump 한 곳으로 나와야 하기 떄문에
      this.setRuleListColorWhenJumped(this.serverSyncIndex);
    });
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
    this._split.forEach((item) => {
      item.destroy();
    });
    this._split = [];
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Snapshot list refresh
   */
  public initSnapshotList() {
    this.ruleListComponent.changeTab(1);
  }

  /**
   * Create snapshot popup close
   */
  public snapshotCreateClose() {
    if (1 === this.ruleListComponent.tabNumber) {
      this.ruleListComponent.getSnapshotList();
    }
  }

  /**
   * Snapshot detail popup open
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
    this.ruleListComponent.clearExistingInterval();
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
    if ($event.ruleInfo) { // Join complete
      this.applyRule($event.ruleInfo);
    } else { // cancel join
      this.jump(this.serverSyncIndex);
    }
    this.isRuleJoinModalShow = false;
  }


  /**
   * union 설정 완료 이벤트
   * @param $event Union 설정 정보
   */
  public ruleUnionComplete($event) {
    if ($event.ruleInfo) { // Union complete
      this.applyRule($event.ruleInfo);
    } else { // Cancel union
      this.jump(this.serverSyncIndex);
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
      this.editorUseLabel = this.translateService.instant('msg.dp.btn.switch.editor');

      // Reset command when switch to builder
      // this.initRule();
    } else {
      this.editorUseFlag = true;
      this.editorUseLabel = this.translateService.instant('msg.dp.btn.switch.builder');
    }
  }

  // command list show
  public showCommandList() {

    // Close all opened select box from rule
    this.broadCaster.broadcast('EDIT_RULE_SHOW_HIDE_LAYER', { id : 'commandList', isShow : false } );

    // 포커스 이동
    setTimeout(() => $('#commandSearch').trigger('focus'));

    this.commandSearchText = '';
    this.isCommandListShow = true;
    this.initSelectedCommand(this.filteredCommandList);

    this.safelyDetectChanges();

  }

  /**
   * When command is selected from commandList
   * @param event
   * @param command
   * */
  public selectCommand(event, command) {
    event.stopImmediatePropagation();

    // TODO : Added getting selected columns from grid because didn't show selected columns when command is changed on edit
    this.selectedColumns = this._editRuleGridComp.getSelectedColumns();
    this.ruleVO.cols = this.selectedColumns;

    if (isNullOrUndefined(command)) {
      return;
    }

    this.ruleVO.command = command.command;
    this.ruleVO.alias = command.alias;
    this.ruleVO.desc = command.desc;

    // 검색어 초기화 및 레이어 닫기
    this.commandSearchText = '';
    this.isCommandListShow = false;
    this.safelyDetectChanges();

    let selectedFields:Field[] = [];
    if( this.selectedColumns ) {
      selectedFields = this.selectedColumns.map( col => this.selectedDataSet.gridData.fields.find( field => field.uuid === col ) );
    }

    switch (this.ruleVO.command) {
      case 'setformat':
        let setformatList = this.selectedDataSet.gridData.fields.filter((item) => {
          return item.type === 'TIMESTAMP'
        });
        let selectedsetformatList = selectedFields.filter((item) => {
          return item.type === 'TIMESTAMP'
        });
        let colDescs = this.selectedDataSet.gridResponse.colDescs.filter((item) => {
          return item.type === 'TIMESTAMP'
        });
        this._editRuleComp.setValue('dsId', this.selectedDataSet.dsId);
        this._editRuleComp.setValue('colTypes', colDescs);
        this._editRuleComp.init(setformatList, selectedsetformatList);
        break;
      case 'settype':
        this._editRuleComp.setValue('dsId', this.selectedDataSet.dsId);
        this._editRuleComp.setValue('colTypes', this.selectedDataSet.gridResponse.colDescs);
        this._editRuleComp.init(this.selectedDataSet.gridData.fields, selectedFields);

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
      case 'Join':
        //this.rightDataset = new Dataset();
        this.rightDataset = new PrDataset();
        this.rightDataset.dsId = '';
        this.isRuleJoinModalShow = true;
        break;
      case 'Union':
        this.editJoinOrUnionRuleStr = '';
        this.isRuleUnionModalShow = true;
        break;
      default:
        this._editRuleComp.init(this.selectedDataSet.gridData.fields, selectedFields );
        break;
    }
    this.initSelectedCommand(this.filteredCommandList);
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
   * Rule cancel or 초기 세팅
   * @param data
   */
  public initRule(data?) {

    // default 는 append
    this.opString = 'APPEND';

    // 룰 리스트에서 선택된 룰이 없게 this.ruleNo 초기화
    this.ruleNo = null;

    this.ruleVO = new Rule();
    // this.inputRuleCmd = '';

    // redo, undo를 초기화 한다.
    if (data) this.initRedoUndo(data);

  } // function - initRule

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

    if( this._isExecAddRule ) {
      this.editorUseFlag = false;
      return;
    }

    this._isExecAddRule = true;

    // // When no command is selected
    // if (this.ruleVO.command === '' || isNullOrUndefined(this.ruleVO.command)) {
    //   return;
    // }
    //
    let rule: any = {};
    if (this.editorUseFlag === false) {

      if (isUndefined(this.ruleVO['command']) || '' === this.ruleVO['command']) {
        Alert.warning(this.translateService.instant('msg.dp.alert.no.data'));
        this._isExecAddRule = false;
        return;
      }

      // get rule string from individual components
      rule = this._editRuleComp.getRuleData();
      if (isUndefined(rule)) {
        this._isExecAddRule = false;
        return;
      }

      // set param
      rule['op'] = this.opString;
      rule['ruleIdx'] = this.serverSyncIndex;

    } else {  // Using editor
      if (this.inputRuleCmd === '') {
        Alert.warning(this.translateService.instant('msg.dp.alert.editor.warn'));
        this._isExecAddRule = false;
        return;
      }
      rule = {
        command: this.inputRuleCmd.substring(0, this.inputRuleCmd.indexOf(' ')),
        op: this.opString,
        rownum: this.opString === 'APPEND' ? this.ruleList.length + 1 : this.ruleVO.rownum,
        ruleString: this.inputRuleCmd
      };
    }
    if (!isUndefined(rule)) {

      let isErrorCommand : boolean = true;
      for(let ind in this.commandList) {
        if ( rule.ruleString.indexOf(this.commandList[ind].command) > -1 ) isErrorCommand = false;
      }
      if (isErrorCommand){
        this._isExecAddRule = false;
        Alert.error(this.translateService.instant('msg.dp.alert.command.error'));
        return;
      }

      this.applyRule(rule);
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

      // Set rulestring for builder
      this.inputRuleCmd = rule.ruleString;


      this.selectboxFlag = true;
      this.initRule();
      this.opString = 'UPDATE';
      this.ruleVO = rule['ruleVO'];
      ('' === this.ruleVO.command) && (this.ruleVO.command = this.ruleVO['name']);

      this.safelyDetectChanges();

      switch (this.ruleVO.command) {
        case 'settype':
          this._editRuleComp.setValue('dsId', this.selectedDataSet.dsId);
          this._editRuleComp.setValue('colTypes', this.selectedDataSet.gridResponse.colDescs);
          this._editRuleComp.init(gridData.fields, [], {ruleString : rule.ruleString, jsonRuleString : JSON.parse(rule.jsonRuleString)});
          break;
        case 'setformat' :
          let setformatList = gridData.fields.filter((item) => {
            return item.type === 'TIMESTAMP'
          });
          let colDescs = this.selectedDataSet.gridResponse.colDescs.filter((item) => {
            return item.type === 'TIMESTAMP'
          });
          this._editRuleComp.setValue('dsId', this.selectedDataSet.dsId);
          this._editRuleComp.setValue('colTypes', colDescs);
          this._editRuleComp.init(setformatList, [],{ruleString : rule.ruleString, jsonRuleString : JSON.parse(rule.jsonRuleString)});
          break;
        case 'flatten' :
          let flattenList = gridData.fields.filter((item) => {
            return item.type === 'ARRAY'
          });
          this._editRuleComp.init(flattenList, [], {ruleString : rule.ruleString, jsonRuleString : JSON.parse(rule.jsonRuleString)});
          break;
        case 'unnest' :
          let unnest = gridData.fields.filter((item) => {
            return item.type === 'ARRAY' || item.type === 'MAP'
          });
          this._editRuleComp.init(unnest, [], {ruleString : rule.ruleString, jsonRuleString : JSON.parse(rule.jsonRuleString)});
          break;
        case 'rename' :
          if (!(this.ruleVO.col['value'] && 'string' === typeof this.ruleVO.col['value'])) {
            let tos = [];
            this.ruleVO.to['value'].forEach((item) => {
              if (item.startsWith('\'') && item.endsWith('\'')) {
                tos.push(item.substring(1, item.length - 1));
              }
            });
            // let cols = _.cloneDeep(this.ruleVO.col['value']);
            // this.multicolumnRenameComponent.init({
            //   data: _.cloneDeep(gridData),
            //   datasetName: this.selectedDataSet.dsName,
            //   ruleCurIdx: rule['ruleNo'],
            //   cols: cols,
            //   to: tos
            // });

            let cols = _.cloneDeep(this.ruleVO.col['value']);
            this.multipleRenamePopupComponent.init({
              gridData: _.cloneDeep(gridData),
              dsName: this.selectedDataSet.dsName,
              typeDesc: this.selectedDataSet.gridResponse.colDescs,
              editInfo: {ruleCurIdx: this.ruleVO['ruleNo'],
                cols: cols,
                to: tos}
            });


            // TODO : ... 지우면 안되는데..
            this.ruleVO.col = '';
            this.ruleVO.to = '';
          }
          this.safelyDetectChanges();
          this._editRuleComp.init(gridData.fields, [], {ruleString : rule.ruleString, jsonRuleString : JSON.parse(rule.jsonRuleString)});
          break;
        case 'delete' :
        case 'keep' :
        case 'derive' :
        case 'set' :
        case 'drop' :
        case 'replace' :
        case 'merge' :
        case 'sort' :
        case 'header' :
        case 'nest' :
        case 'unpivot' :
        case 'move' :
        case 'split' :
        case 'extract' :
        case 'countpattern' :
        case 'aggregate' :
        case 'pivot' :
        case 'window' :
          this._editRuleComp.init(gridData.fields, [], {ruleString : rule.ruleString, jsonRuleString : JSON.parse(rule.jsonRuleString)});
          break;
        case 'Union' :
          if (this.selectedDataSet.gridData.data.length > 1) {
            this.editJoinOrUnionRuleStr = rule['jsonRuleString'];
            this.isUpdate = true;
            this.isRuleUnionModalShow = true;
          } else {
            Alert.warning('No rows to union');
          }

          break;
        case 'Join' :

          if (this.selectedDataSet.gridData.data.length > 1) {
            this.editJoinOrUnionRuleStr = rule['jsonRuleString'];
            this.setJoinEditInfo(rule);
          } else {
            Alert.warning('No rows to join');
          }
          break;
        default:
          break;
      }

      // TODO : for editor
      // this.inputRuleCmd = PreparationCommonUtil.makeRuleResult(this.ruleVO);
    } catch (e) {
      Alert.error(this.translateService.instant('msg.dp.alert.rule.edit.fail'));
    }
  }


  /**
   * 룰 수정 클릭시
   * @param editInfo
   */
  public setEditData(editInfo) {

    // unselect all columns in current grid
    this._editRuleGridComp.unSelectionAll('COL');

    // set current index (when editing subtract 1 from index)
    let ruleIdx = editInfo.ruleNo-1;

    // 인풋박스 포커스 여부 IE 에서 수정버튼을 누르면 툴팁 박스가 열려서...
    this.isFocus = false;

    this._setEditRuleInfo({op: 'PREPARE_UPDATE', ruleIdx: ruleIdx, count: 100, offset: 0})
      .then((data: { apiData: any, gridData: any }) => {

        if (data['error']) {
          let prep_error = this.dataprepExceptionHandler(data['error']);
          PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
          return;
        }
        this.setEditInfo(editInfo, data.gridData);
        this.opString = 'UPDATE';
        this.serverSyncIndex = ruleIdx+1;
        this.setRuleListColorWhenJumped(this.serverSyncIndex);
        this.setCancelBtnWhenEditMode(this.serverSyncIndex);
      });
  } // function - setRuleVO

  /**
   * Delete rule
   * @param {number} ruleNo
   */
  public deleteRule(ruleNo : number) {
    this.serverSyncIndex = ruleNo;
    this.refreshEditMode();
    this.applyRule({ op: 'DELETE', ruleIdx: this.serverSyncIndex, count:100 });
  }

  /**
   * Init edit mode
   */
  public refreshEditMode() {
    this.opString = 'APPEND';
    this.inputRuleCmd = '';
    this.editorUseFlag = false;
  }

  /**
   * Change to different dataset in same dataflow
   * @param dataset {Dataset}
   */
  //public changeWrangledDataset(dataset : Dataset) {
  public changeWrangledDataset(dataset : PrDataset) {
    this.loadingShow();

    let dataflows = this.selectedDataSet.dataflows ? this.selectedDataSet.dataflows : null;

    delete this.selectedDataSet;
    this.selectedDataSet = dataset;

    // if (!this.selectedDataSet['_embedded']) {
    //   this.selectedDataSet['_embedded'] = {};
    // }
    if (!this.selectedDataSet.dataflows && null != dataflows) {
      this.selectedDataSet.dataflows = dataflows;
    }

    this._setEditRuleInfo({op:'INITIAL', ruleIdx: null, count: 100, offset: 0}).then((data) => {

      if (data['error']) {
        let prep_error = this.dataprepExceptionHandler(data['error']);
        PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
        return;
      }

      this.selectedDataSet.dsId = data.apiData.dsId;
      this.changeDataset.emit(data.apiData);
    });

  }

  /**
   * Redo or undo
   * @param {string} action
   */
  public transformAction(action : string) {
    this.refreshEditMode();
    const rule = { op: action };
    if (action === 'UNDO') {
      if (!this.undoable) {
        return;
      }
      if (this.isUndoRunning === false) {
        this.isUndoRunning = true;
      }
    } else if (action === 'REDO') {
      if (!this.redoable) {
        return;
      }
      if (this.isRedoRunning === false) {
        this.isRedoRunning = true;
      }

    }
    this.applyRule(rule, action === 'UNDO')

  }

  /**
   * Jump Action
   * @param idx - from rule list
   */
  public jump(idx: number) {

    // Change edit mode to false
    this.refreshEditMode();

    // clear all selected columns and rows
    this._editRuleGridComp.unSelectionAll();

    this.loadingShow();

    this.opString = 'JUMP';

    // Get grid of selected index
    this._setEditRuleInfo({op: this.opString, ruleIdx: idx, count: 100 }).then((data) => {

      if (data['error']) {
        let prep_error = this.dataprepExceptionHandler(data['error']);
        PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
        return;
      }

      // set affected columns
      data.apiData.gridResponse.interestedColNames.forEach(col => {

        if ('' !== this._editRuleGridComp.getColumnUUIDByColumnName(col)) {
          this._editRuleGridComp.selectColumn(this._editRuleGridComp.getColumnUUIDByColumnName(col), true);
        }

      });
      this.loadingHide();
      this.serverSyncIndex = data.apiData.ruleCurIdx;

      this.setRuleListColorWhenJumped(this.serverSyncIndex);
      this.ruleListComponent.selectedRuleIdx = this.serverSyncIndex;

    });
  }

  /**
   * Add cancel button to insert step index
   * @param {number} idx
   */
  public setInsertStep(idx : number ) {
    this.ruleList[idx]['isInsertStep'] = true;
  }


  /**
   * When insert step button is clicked from rule list, jump to selected index
   * @param {number} ruleNo
   */
  public insertStep(ruleNo: number) {
    this.opString = 'INITIAL';
    this.jumpToInsertStep(ruleNo);
  }

  /**
   * Jump but op is GET
   * @param idx - from rule list
   */
  public jumpToInsertStep(idx: number) {

    // clear all selected columns and rows
    this._editRuleGridComp.unSelectionAll();
    let tempOpString = this.opString;
    this.loadingShow();

    // Get grid of selected index
    this._setEditRuleInfo({op: tempOpString, ruleIdx: idx, count: 100, offset: 0 }).then((data) => {

      if (data['error']) {
        let prep_error = this.dataprepExceptionHandler(data['error']);
        PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
        return;
      }

      // set affected columns
      data.apiData.gridResponse.interestedColNames.forEach(col => {
        if ('' !== this._editRuleGridComp.getColumnUUIDByColumnName(col)) {
          this._editRuleGridComp.selectColumn(this._editRuleGridComp.getColumnUUIDByColumnName(col), true);
        }
      });
      this.loadingHide();
      this.serverSyncIndex = data.apiData.ruleCurIdx;

      // set rule list color (-1 as 1 was added to match server list index before sending API)
      this.setRuleListColorWhenJumped(this.serverSyncIndex);
      this.opString = 'APPEND';
      this.setInsertStep(this.serverSyncIndex);
    });
  }


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
   * Select box for commands - navigate with keyboard
   * @param event 이벤트
   * @param currentList 현재 사용하는 리스트
   * @param clickHandler
   */
  public navigateWithKeyboardShortList(event, currentList, clickHandler) {

    // open select box when arrow up/ arrow down is pressed
    if (event.keyCode === 38 || event.keyCode === 40) {
      switch (clickHandler) {
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
      this.selectCommand(event, currentList[idx]);
      $('[tabindex=1]').trigger('focus');
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
   * @param idx
   */
  public setRuleListColorWhenJumped(idx : number) {
    this.ruleList.forEach((item, index) => {
      item.isValid = !(index === idx || index < idx);
    });
  }

  /**
   * Add cancel button to specific rule when edit button is clicked
   * @param {number} idx
   */
  public setCancelBtnWhenEditMode(idx : number) {
    this.ruleList[idx]['isEditMode'] = true;
  }

  /**
   * Open advanced formula input popup (set, keep, derive, delete)
   * @param {string} command
   */
  public openPopupFormulaInput(data: {command : string, val : string, needCol?:boolean}) {
    const fields: Field[] = this.selectedDataSet.gridData.fields;

    // variables vary according to the rule name
    // use this._editRuleComp.getValue({}) to get condition of each rule
    // let val : string = 'rowNum';
    // if (command === 'derive') {
    //   val = 'deriveVal';
    // } else if (command === 'set') {
    //   val = 'inputValue';
    // } else if (command === 'replace' || command === 'setCondition') {
    //   val = 'condition';
    // } else if (command === 'keep') {
    //   val = 'keepRow';
    // }

  
    //this.extendInputFormulaComponent.open(fields, data.command, this._editRuleComp.getValue( data.val ));

    data.val = this._editRuleComp.getValue( data.val );
    this.extendInputFormulaComponent.open(fields, data);
  }

  /**
   * Apply formula using Advanced formula popup
   * @param {{command: string, formula: string}} data
   */
  public doneInputFormula(data: { command: string, formula: string }) {
    this._editRuleComp.doneInputFormula(data);
  }

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
      case 'create':
        result = `Create with DS ${rule.with}`;
        break;
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
      case 'Union':
      case 'Join':
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
      default:
        result = '';
        break;

    }
    return result
  }

  /**
   * Multicolumn rename popup open
   */
  public onMultiColumnRenameClick() {

    if ('UPDATE' === this.opString) {
      this.multipleRenamePopupComponent.init({gridData: _.cloneDeep(this.selectedDataSet.gridData),
        dsName: this.selectedDataSet.dsName,
        typeDesc: this.selectedDataSet.gridResponse.colDescs,
        editInfo: {ruleCurIdx: this.ruleVO['ruleNo'],
          cols: this.ruleVO.cols,
          to: [this.ruleVO.to]}
      });
    } else {
      this.multipleRenamePopupComponent.init({gridData: _.cloneDeep(this.selectedDataSet.gridData),
        dsName: this.selectedDataSet.dsName, typeDesc: this.selectedDataSet.gridResponse.colDescs});
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

    this.selectedColumns = data.columns;

  } // function - setRuleInfoFromGridHeader




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
          this._editRuleComp.init(this.selectedDataSet.gridData.fields, this.selectedDataSet.gridData.fields.filter( item => -1 < data.more.col.value.indexOf( item.uuid ) ));
          break;
        case 'unnest':
          let unnestList = this.selectedDataSet.gridData.fields.filter((item) => {
            return item.type === 'ARRAY' || item.type === 'MAP'
          });
          let selectedUnnestList =  this.selectedDataSet.gridData.fields.filter( item => -1 < data.more.col.value.indexOf( item.uuid ) ).filter((item) => {
            return item.type === 'ARRAY' || item.type === 'MAP'
          });
          this._editRuleComp.init(unnestList, selectedUnnestList);
          break;
        case 'setformat':
          let setformatList = this.selectedDataSet.gridData.fields.filter((item) => {
            return item.type === 'TIMESTAMP'
          });
          let setformatSel =  this.selectedDataSet.gridData.fields.filter( item => -1 < data.more.col.value.indexOf( item.uuid ) ).filter((item) => {
            return item.type === 'TIMESTAMP'
          });
          let colDescs = this.selectedDataSet.gridResponse.colDescs.filter((item) => {
            return item.type === 'TIMESTAMP'
          });
          this._editRuleComp.setValue('dsId', this.selectedDataSet.dsId);
          this._editRuleComp.setValue('colTypes', colDescs);
          this._editRuleComp.init(setformatList, setformatSel);
          break;
        case 'move':
          this._editRuleComp.init(this.selectedDataSet.gridData.fields, this.selectedDataSet.gridData.fields.filter( item => -1 < data.more.col.value.indexOf( item.uuid ) ), {ruleString : '', jsonRuleString : data.more});
          break;
        case 'set':

          if (data.more.contextMenu) {
            this._editRuleComp.init(this.selectedDataSet.gridData.fields, this.selectedDataSet.gridData.fields.filter( item => -1 < data.more.col.value.indexOf( item.uuid ) ), {ruleString : '', jsonRuleString : data.more});
          } else {
            this._editRuleComp.init(this.selectedDataSet.gridData.fields, this.selectedDataSet.gridData.fields.filter( item => -1 < data.more.col.value.indexOf( item.uuid ) ));
          }

          break;
        case 'derive':
          this._editRuleComp.init(this.selectedDataSet.gridData.fields, []);
          break;
        case 'settype':
          this._editRuleComp.setValue('colTypes', this.selectedDataSet.gridResponse.colDescs);
          this._editRuleComp.setValue('dsId', this.selectedDataSet.dsId);
          this._editRuleComp.setValue('selectedType', data.more.type);
          let idx = this.selectedDataSet.gridResponse.colDescs.findIndex((item) => {
            return item.type === data.more.type.toUpperCase();
          });
          this._editRuleComp.setValue('defaultIndex', idx);
          this._editRuleComp.init(this.selectedDataSet.gridData.fields, this.selectedDataSet.gridData.fields.filter( item => -1 < data.more.col.value.indexOf( item.uuid ) ));
          break;
      }
    } else {

      data['ruleCurIdx'] = this.opString === 'UPDATE' ? this.serverSyncIndex-1 : this.serverSyncIndex;
      data['op'] = this.opString === 'UPDATE' ? 'UPDATE' : 'APPEND';
      this.applyRule(data);

    }

  } // function - applyRuleFromContextMenu

  /**
   * When cancel button is clicked. Cancels edit mode and jump to current index
   */
  public jumpToCurrentIndex() {

    if (this.inputRuleCmd !== '') {
      this.inputRuleCmd = ''; // Empty builder rule string
    } else {
      if (!this.editorUseFlag) {
        // If no command is selected nothing happens
        if (this.ruleVO.command === '' || isNullOrUndefined(this.ruleVO.command)) {
          return;
        }
      }
    }

    // Change button
    this.opString = 'APPEND';

    // Unselect all columns
    this._editRuleGridComp.unSelectionAll();

    // Jumps to current index
    this.jump(this.serverSyncIndex);

    // TODO : check if necessary
    this.ruleVO.command = '';
    this.selectedColumns = [];
    this.editColumnList = [];
  }


  /**
   * Apply multi column rename
   * @param data
   */
  public onRenameMultiColumns(data) {

    if (isNullOrUndefined(data) ) { // Cancel rename if nothing is changed
      this.jumpToCurrentIndex()
    } else {
      this.applyRule(data);
    }

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 룰 편집 정보 설정
   * @param {any} params
   * @returns {Promise<any>}
   * @private
   */
  private _setEditRuleInfo( params : any ): Promise<any> {
    this.loadingShow();

    this.isInitDataLoaded = true;
    this.safelyDetectChanges();

    return this._editRuleGridComp.init(this.selectedDataSet.dsId, params)
      .then((data: { apiData: any, gridData: any }) => {

        if (isNullOrUndefined(data.apiData)) {

          // remove ` from field name when error
          this.selectedDataSet.gridData.fields.filter((item) => {
            return item.name =  item.name.replace(/`/g, '');
          });

          return {
            error : data['error']
          }
        }
        const apiData = data.apiData;
        this.serverSyncIndex = data.apiData.ruleCurIdx;

        if (apiData.errorMsg) {
          this.loadingHide();
          Alert.warning(this.translateService.instant('msg.dp.alert.ds.retrieve.fail'));
        } else {

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

          // Set rule list
          //this.setRuleList(apiData['ruleStringInfos']);
          this.setRuleList(apiData['transformRules']);
          this.isAggregationIncluded = this.hasAggregation();

          // init ruleVO
          this.initRule(apiData);

          this.loadingHide();
        }

        return data;
      })
  } // function - _setEditRuleInfo

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
      this.isCommandListShow = false;
      this.isUpdate = false;
    }
  }

  /**
   * apply rule with enter key
   */
  @HostListener('document:keydown.enter', ['$event'])
  private onEnterKeydownHandler(event: KeyboardEvent) {

    /*
      1. 편집중이 아닐 떄 : 동작 안함
      2. 편집중일떄
        2.0. 일반적인 경우 : 동작
        2.1. 콤보박스 : 동작 안함
        2.2. 자동완성 : 레이어가 닫혀있거나, 레이어에 포커스가 안된 상태에서만 동작
        2.3. 설명레이어 : 관계 없이 동작
        2.4. 팝업 : 동작 안함
     */
    if( !isNullOrUndefined( this.ruleVO.command ) && ( 'BODY' === event.target['tagName'] || 0 < $( event.target ).closest( '.ddp-wrap-addrule' ).length )  ) {
      // enter key only works when there is not popup or selectbox opened

      const openComboList = $( '.ddp-list-selectbox:visible' );

      if( 0 < openComboList.length ) {
        const isAutoComple:boolean = 0 < openComboList.closest( 'rule-condition-input' ).length;
        if( isAutoComple ) {
          // 자동완성 : 레이어가 열려있음

          let isPrevBackColor:string = '';
          let isFocus:boolean = false;
          $( '.ddp-list-selectbox:visible' ).find( 'li a' ).each( ( idx, val ) => {
            const $listItem = $( val );
            if( 0 === idx ) {
              isPrevBackColor = $listItem.css( 'background-color' );
            } else {
              if( isPrevBackColor !== $listItem.css( 'background-color' ) ) {
                isFocus = true;
                return;
              } else {
                isPrevBackColor = $listItem.css( 'background-color' );
              }
            }
          });

          if( isFocus ) {
            // 포커스가 된 상태 - 동작 안함
            return;
          } else {
            // 포커스가 안 된 상태 - 동작
            this.addRule();
          }
        } else {
          // 콤보박스 : 열림 상태 - 동작 안함
          return;
        }
      } else if( 0 < $( '.ddp-bg-popup:visible' ).length ) {
        // 팝업 : 열림 상태 - 동작 안함
        return;
      } else {
        this.addRule();
      }
    }

  } // function - onEnterKeydownHandler


  /**
   * Set rule list
   */
  private setRuleList(rules: any) {
    this.ruleList = [];

    const commandNames = [];
    this.commandList.forEach((command) => {
      commandNames.push(command.command);
    });

    // ruleStringInfos
    rules.forEach((rule) => {
      rule['ruleVO'] = JSON.parse(rule['jsonRuleString']);
      rule['ruleVO']['command'] = rule['ruleVO']['name'];
      rule['ruleVO']['ruleNo'] = rule['ruleNo'];

      if (rule['ruleVO'].command === 'join') {
        rule['ruleVO'].command = 'Join'
      } else if (rule['ruleVO'].command === 'union') {
        rule['ruleVO'].command = 'Union'
      }

      const idx = commandNames.indexOf(rule['ruleVO'].command);
      if (idx > -1) {
        rule['command'] = this.commandList[idx].command;
        rule['alias'] = this.commandList[idx].alias;
        rule['desc'] = this.commandList[idx].desc;

        if (rule.shortRuleString) {
          rule['simplifiedRule'] = rule.shortRuleString
        } else {
          const ruleStr = PreparationCommonUtil.simplifyRule(rule['ruleVO'], this.selectedDataSet.gridResponse.slaveDsNameMap, rule.ruleString)
          if (!isUndefined(ruleStr)) {
            rule['simplifiedRule'] = ruleStr;
          } else {
            rule['simplifiedRule'] = rule.ruleString;
          }
        }
      } else {
        rule['simplifiedRule'] = rule.shortRuleString ? rule.shortRuleString : rule.ruleString;
        rule['command'] = 'Create';
        rule['alias'] = 'Cr';
        rule['desc'] = '';
      }
      this.ruleList.push(rule);
    });
  }


  private initViewPage() {
    this.commandList = [
      {
        command: 'header',
        alias: 'He',
        desc: this.translateService.instant('msg.dp.li.he.description'),
        isHover: false,
        command_h: ['ㅗㄷㅁㅇㄷㄱ']
      },
      { command: 'keep',
        alias: 'Ke',
        desc: this.translateService.instant('msg.dp.li.ke.description'),
        isHover: false,
        command_h: ['ㅏㄸ','ㅏ떼','ㅏㄷ','ㅏㄷ데']
      },
      {
        command: 'replace',
        alias: 'Rp',
        desc: this.translateService.instant('msg.dp.li.rp.description'),
        isHover: false,
        command_h: ['ㄱㄷ','ㄱ데ㅣㅁㅊㄷ']
      },
      {
        command: 'rename',
        alias: 'Rn',
        desc: this.translateService.instant('msg.dp.li.rn.description'),
        isHover: false,
        command_h: ['ㄱㄷ','ㄱ둠','ㄱ두므','ㄱ두믇']
      },
      { command: 'set',
        alias: 'Se',
        desc: this.translateService.instant('msg.dp.li.se.description'),
        isHover: false,
        command_h: ['ㄴㄷㅅ']
      },
      {
        command: 'settype',
        alias: 'St',
        desc: this.translateService.instant('msg.dp.li.st.description'),
        isHover: false,
        command_h: ['ㄴㄷㅆ','ㄴㄷ쑈ㅔㄷ','ㄴㄷㅅ','ㄴㄷㅅ쇼ㅔㄷ']
      },
      {
        command: 'countpattern',
        alias: 'Co',
        desc: this.translateService.instant('msg.dp.li.co.description'),
        isHover: false,
        command_h: ['ㅊ','채ㅕㅜㅅ','채ㅕㅜ세','채ㅕㅜ셈ㅆㄷㄱ','채ㅕㅜ셈ㅆㄷ구','채ㅕㅜ셈ㅅㅅㄷ','채ㅕㅜ셈ㅅㅅㄷ구']
      },
      {
        command: 'split',
        alias: 'Sp',
        desc: this.translateService.instant('msg.dp.li.sp.description'),
        isHover: false,
        command_h: ['ㄴ','네ㅣㅑㅅ']
      },
      {
        command: 'derive',
        alias: 'Dr',
        desc: this.translateService.instant('msg.dp.li.dr.description'),
        isHover: false,
        command_h: ['ㅇㄷ갸','ㅇㄷ걒ㄷ']
      },
      {
        command: 'delete',
        alias: 'De',
        desc: this.translateService.instant('msg.dp.li.de.description'),
        isHover: false,
        command_h: ['ㅇㄷ','ㅇ디','ㅇ딛ㅅㄷ']
      },
      { command: 'drop',
        alias: 'Dp',
        desc: this.translateService.instant('msg.dp.li.dp.description'),
        isHover: false,
        command_h: ['ㅇㄱ','ㅇ개ㅔ']
      },
      {
        command: 'pivot',
        alias: 'Pv',
        desc: this.translateService.instant('msg.dp.li.pv.description'),
        isHover: false,
        command_h: ['ㅔㅑㅍ','ㅔㅑ패','ㅔㅑ팻']
      },
      {
        command: 'unpivot',
        alias: 'Up',
        desc: this.translateService.instant('msg.dp.li.up.description'),
        isHover: false,
        command_h: ['ㅕㅜ','ㅕㅞㅑ','ㅕㅞㅑㅍ','ㅕㅞㅑ패','ㅕㅞㅑ팻']
      },
      { command: 'Join',
        alias: 'Jo',
        desc: this.translateService.instant('msg.dp.li.jo.description'),
        isHover: false,
        command_h: ['ㅓㅐㅑㅜ']
      },
      {
        command: 'extract',
        alias: 'Ex',
        desc: this.translateService.instant('msg.dp.li.ex.description'),
        isHover: false,
        command_h: ['ㄷㅌㅅㄱㅁㅊㅅ']
      },
      {
        command: 'flatten',
        alias: 'Fl',
        desc: this.translateService.instant('msg.dp.li.fl.description'),
        isHover: false,
        command_h: ['ㄹ','리','림ㅆㄷ','림ㅆ두','림ㅅㅅㄷ','림ㅅㅅ두']
      },
      {
        command: 'merge',
        alias: 'Me',
        desc: this.translateService.instant('msg.dp.li.me.description'),
        isHover: false,
        command_h: ['ㅡㄷㄱㅎㄷ']
      },
      { command: 'nest',
        alias: 'Ne',
        desc: this.translateService.instant('msg.dp.li.ne.description'),
        isHover: false,
        command_h: ['ㅜㄷㄴㅅ']
      },
      {
        command: 'unnest',
        alias: 'Un',
        desc: this.translateService.instant('msg.dp.li.un.description'),
        isHover: false,
        command_h: ['ㅕㅜㅜㄷㄴㅅ']
      },
      {
        command: 'aggregate',
        alias: 'Ag',
        desc: this.translateService.instant('msg.dp.li.ag.description'),
        isHover: false,
        command_h: ['ㅁㅎㅎㄱㄷㅎㅁㅅㄷ']
      },
      {
        command: 'sort',
        alias: 'So',
        desc: this.translateService.instant('msg.dp.li.so.description'),
        isHover: false,
        command_h: ['ㄴ','내','낵','낷']
      },
      {
        command: 'move',
        alias: 'Mv',
        desc: this.translateService.instant('msg.dp.li.mv.description'),
        isHover: false,
        command_h: ['ㅡㅐㅍㄷ']
      },
      {
        command: 'Union',
        alias: 'Ui',
        desc: this.translateService.instant('msg.dp.li.ui.description'),
        isHover: false,
        command_h: ['ㅕㅜㅑㅐㅜ']
      },
      {
        command: 'setformat',
        alias: 'Sf',
        desc: this.translateService.instant('msg.dp.li.sf.description'),
        isHover: false,
        command_h: ['ㄴㄷㅅ랙','ㄴㄷㅅ래그','ㄴㄷㅅ래금ㅅ']
      },
      {
        command: 'window',
        alias: 'Wn',
        desc: this.translateService.instant('msg.dp.li.wd.description'),
        isHover: false,
        command_h: ['ㅈ','쟈ㅜㅇ','쟈ㅜ애','쟈ㅜ앶']
      }
    ];

    // set rule
    if (this.selectedDataSet.rules && this.selectedDataSet.rules.length > 0) {
      this.setRuleList(this.selectedDataSet.rules);
      this.isAggregationIncluded = this.hasAggregation();
    }

    // init ruleVO
    this.ruleVO.command = '';

  }

  /**
   * apply rule
   * @rule Rule
   * @msg translate key
   * @isUndo
   */
  private applyRule(rule: object, isUndo?: boolean) {

    let command = rule['command'];

    // Save current scroll position
    this._editRuleGridComp.savePosition();

    this.loadingShow();

    this.changeDetect.detectChanges();

    // TODO : Check if necessary - Unselect all columns
    // this.selectedRows = [];
    // this.editColumnList = [];

    this.isJumped = false;
    (command === 'multipleRename') && (this.multicolumnRenameComponent.showFlag = false);


    this.opString = rule['op'];

    this._setEditRuleInfo({op: this.opString, ruleIdx : this.serverSyncIndex, count: 100, ruleString : rule['ruleString'] }).then((data: { apiData: any, gridData: any }) => {

      this._isExecAddRule = false;

      if (data['error']) {
        let prep_error = this.dataprepExceptionHandler(data['error']);
        PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
        return;
      }

      // TODO : need to refresh selected column after applying rule
      this._editRuleGridComp.unSelectionAll();

      this.serverSyncIndex = data.apiData.ruleCurIdx;
      //if (data.apiData.ruleStringInfos.length > 0) {
      if (data.apiData.transformRules.length > 0) {
        this._editRuleGridComp.setAffectedColumns(
          data.apiData.gridResponse['interestedColNames'],
          //data.apiData.ruleStringInfos[data.apiData.ruleStringInfos.length - 1].command);
          data.apiData.transformRules[data.apiData.transformRules.length - 1].command);
      }

      // 룰 리스트는 index 보다 하나 적게
      this.setRuleListColorWhenJumped(this.serverSyncIndex);
      this.ruleListComponent.selectedRuleIdx = this.serverSyncIndex;

      if (command !== 'join' && command !== 'derive' && command !== 'aggregate' && command !== 'move') {
        // 저장된 위치로 이동
        // this._editRuleGridComp.moveToSavedPosition();
      }
      // 계속 클릭하는거 방지
      if (isUndo && this.isUndoRunning) {
        this.isUndoRunning = false;
      } else if (!isUndo && this.isRedoRunning) {
        this.isRedoRunning = false;
      }

      this.inputRuleCmd = '';

    });

  }

  /**
   * Set join info when editing
   * @param rule
   */
  private setJoinEditInfo(rule) {
    //this.rightDataset = new Dataset();
    this.rightDataset = new PrDataset();

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
   * Check if rule list contains aggregate rule
   * returns true is rule list contains aggregate rule
   * @returns {boolean}
   */
  private hasAggregation() {

    // clone ruleList
    let rules = [...this.ruleList];

    // Only use up to serverSyncIndex
    rules = rules.splice(0,this.serverSyncIndex+1);

    const idx: number = rules.findIndex((item) => {
      return item.valid && item.command === 'aggregate';
    });
    return !(idx === -1);
  }

}

class JoinInfo {
  public leftJoinKey: string;
  public rightJoinKey: string;
}
