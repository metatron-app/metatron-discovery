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

import { Component, ElementRef, EventEmitter, Injector, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractComponent } from '../../../../../common/component/abstract.component';
import { Alert } from '../../../../../common/util/alert.util';
import { EventBroadcaster } from '../../../../../common/event/event.broadcaster';

@Component({
  selector: 'app-rule-context-menu',
  templateUrl: './rule-context-menu.component.html',
})
export class RuleContextMenuComponent extends AbstractComponent implements OnInit, OnDestroy{


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @Output()
  private applyRuleEvent = new EventEmitter();
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public isShow : boolean = false;
  // Rule Lists

  public top : string;
  public left : string;

  public originalSelectedCols : string[];
  public selectedColumnName : string;
  public selectedColumnIdx : number;
  public selectedGridResponse : any;
  public selectedColumnType : string;
  public histogramData : any;
  public labelsForNumbers : any;
  public commandList : any;
  public isColumnSelect : boolean = false;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected elementRef: ElementRef,
              protected injector: Injector,
              private broadCaster: EventBroadcaster) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public ngOnInit() {
    super.ngOnInit();
    this.subscriptions.push(this.broadCaster.on<any>('EDIT_RULE_SHOW_HIDE_LAYER').subscribe(() => {
      this.isShow = false;
    }));
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public openContextMenu(data, selectedColumns?, params?) {

    this.broadCaster.broadcast('EDIT_RULE_SHOW_HIDE_LAYER', { isShow : false } );

    this.labelsForNumbers = params.labels;
    this.histogramData = params.values;
    this.originalSelectedCols = selectedColumns;
    this.selectedColumnName = data.columnName;
    this.selectedColumnIdx = data.index;
    this.selectedGridResponse = data.gridResponse;
    this.selectedColumnType = data.columnType;
    this.isColumnSelect = params.isColumnSelect;
    this.top = data.top + 'px';
    this.left = data.left + 'px';

    if (params.selected) {
      this.originalSelectedCols = params.selected ;
    }

    // Check if settype rule should be disasbled or not
    let indexArray = [];
    selectedColumns.forEach((item) => {
      if (-1 !== this.selectedGridResponse.colNames.indexOf(item) ) {
        indexArray.push(this.selectedGridResponse.colNames.indexOf(item));
      }
    });

    let isAllTimestampTypes = false;
    if (indexArray.length !== 0 && indexArray.length > 1) {
      indexArray.forEach((item) => {
        if (this.selectedGridResponse.colDescs[item].type === 'TIMESTAMP'){
          isAllTimestampTypes = true;
        }
      })
    }

    let isSetformatDisable = false;
    if (indexArray.length !== 0 && indexArray.length > 1) {
      indexArray.forEach((item) => {
        if (this.selectedGridResponse.colDescs[item].type !== 'TIMESTAMP'){
          isSetformatDisable = true;
        }
      })
    }


    this.commandList = [
      {label : 'Drop', value: 'drop', iconClass: 'ddp-icon-drop-editdel3' , command: 'drop'},
      {label : 'Alter', value: 'rename', iconClass: 'ddp-icon-drop-change',
        children : [
          {label : 'Column type', value : 'settype', command: 'settype',
            children : [
              {label : 'Long', value : 'Long', command : 'settype'},
              {label : 'Double', value : 'Double', command : 'settype'},
              {label : 'Boolean', value : 'Boolean', command : 'settype'},
              {label : 'Timestamp', value : 'Timestamp', command : 'settype', disabled : this.originalSelectedCols.length === 1? this.selectedColumnType === 'TIMESTAMP' : isAllTimestampTypes },
              {label : 'String', value : 'String', command : 'settype'}
              ]
          },
          {label : 'Set format', value : 'setformat', command: 'setformat', disabled : this.originalSelectedCols.length === 1? this.selectedColumnType !== 'TIMESTAMP' : isSetformatDisable },
          {label : 'Column name', value : 'rename', command: 'rename' }
          ]
      },
      {label : 'Edit', value: 'edit', iconClass: 'ddp-icon-drop-editmodify' , command: 'edit',
        children : [
          {label : 'Replace', value : 'replace', command: 'edit'},
          {label : 'Set', value : 'set', command: 'edit'},
          {label : 'Keep', value : 'keep', command: 'edit', disabled : (!params.clickable) || (this.selectedColumnType === 'MAP' || this.selectedColumnType === 'ARRAY')},
          {label : 'Delete', value : 'delete', command: 'edit', disabled : (!params.clickable) || (this.selectedColumnType === 'MAP' || this.selectedColumnType === 'ARRAY')}
        ]
      },
      {label : 'Generate', value: 'generate', iconClass: 'ddp-icon-drop-generate' , command: 'generate',
        children : [
          {label : 'Duplicate', value : 'duplicate', command: 'generate'},
          {label : 'Derive', value : 'derive', command: 'generate'},
          {label : 'Split', value : 'split', command: 'generate'},
          {label : 'Extract', value : 'extract', command: 'generate'},
          {label : 'Count pattern', value : 'countpattern', command: 'generate'},
          {label : 'Merge', value : 'merge' , disabled : (selectedColumns.length === 1 && selectedColumns[0] === data.columnName) || selectedColumns.length === 0, command: 'generate'},
          {label : 'Nest', value : 'nest', disabled : (selectedColumns.length === 1 && selectedColumns[0] === data.columnName) || selectedColumns.length === 0, command: 'generate'},
          {label : 'Unnest', value : 'unnest', disabled : this.selectedColumnType !== 'ARRAY' && this.selectedColumnType !== 'MAP', command: 'generate'},
          {label : 'Flatten', value : 'flatten' , disabled : this.selectedColumnType !== 'ARRAY', command: 'generate'},

        ]
      }
      ,
      {label : 'Sort', value: 'sort', iconClass: 'ddp-icon-drop-sort' , command: 'sort',
        children : [
          {label : 'Ascending', value : 'asc', command: 'sort'},
          {label : 'Descending', value : 'desc', command: 'sort'}
          ]
      },
      {label : 'Move', value: 'move', iconClass: 'ddp-icon-drop-move' , command: 'move',
        children : [
          {label : 'First', value : 'first', command : 'move'},
          {label : 'Last', value : 'last', command : 'move'},
          {label : 'Before ..', value : 'before', command : 'move'},
          {label : 'After ..', value : 'after', command : 'move'}
          ]
      }
    ];
    this.isShow = true;
  }

  public _selectCommand(command) {

    if (!(command.children && 0 < command.children.length)) { // 하위 메뉴가 있으면 클릭 불가
      let rule = {};
      switch(command.command) {
        case 'rename':
          rule['more'] = { command : 'rename', col : this.selectedColumnName};
          break;
        case 'drop':
          if (this.selectedGridResponse.colNames.length === 1) { // at least one column must exist
            Alert.warning('Cannot delete all columns');
            return;
          }
          rule['ruleString'] = command.value + ' col: ' + this.originalSelectedCols.join(',');
          break;
        case 'settype':
          switch(command.value) {
            case 'Long':
            case 'Double':
            case 'Boolean':
              rule['ruleString'] = 'settype col: ' + this.originalSelectedCols.join(',') + ' type: ' + command.value;
              break;
            case 'String':
              if(this.selectedColumnType.toUpperCase() === 'TIMESTAMP') {
                // timestamp 타입일 때 string으로 바꾼다면 .
                rule['more'] = { command : 'settype', col : this.originalSelectedCols, type : command.value};
              } else {
                rule['ruleString'] = 'settype col: ' + this.originalSelectedCols.join(',') + ' type: ' + command.value;
              }
              break;
            case 'Timestamp':
              rule['more'] = { command : 'settype', col : this.originalSelectedCols, type : command.value};
              break;
          }
          break;
        case 'setformat':
          rule['more'] = { command : 'setformat', col : this.originalSelectedCols, type : command.value};
          break;
        case 'sort':
          rule['ruleString'] = 'sort order: ' + this.originalSelectedCols.join(',');
          if (command.value === 'desc') {
            rule['ruleString'] += ' type:\'desc\'';
          }
          break;
        case 'move':
          if (command.value === 'first') {
            let first = this.selectedGridResponse.colNames[0];
            rule['ruleString'] = `move col: ${this.originalSelectedCols.join(',')} before: ${first}`;
          } else if (command.value === 'last') {
            let last = this.selectedGridResponse.colNames[this.selectedGridResponse.colNames.length-1];
            rule['ruleString'] = `move col: ${this.originalSelectedCols.join(',')} after: ${last}`;
          } else if (command.value === 'before' || command.value === 'after') {
            rule['more'] = { command : 'move', col : this.originalSelectedCols, move : command.value};
          }
          break;
        case 'edit':
          if (command.value === 'replace' || command.value === 'set') {
            rule['more'] = { command : command.value, col : this.originalSelectedCols};
          } else if (command.value === 'keep' || command.value === 'delete') {
            let result = '';
            if (this.isColumnSelect) {
              let list = [];
              this.histogramData.forEach((item) => {
                if ('matched' === item) {
                  list.push(`!ismismatched(${this.selectedColumnName},'${this.selectedColumnType}')`)
                } else if ('missing' === item) {
                  list.push( `ismissing(${this.selectedColumnName})`)
                } else if ('mismatched' === item) {
                  list.push(`ismismatched(${this.selectedColumnName},'${this.selectedColumnType}')`)
                }
              });
              result = list.join(' && ');
            } else if (this.selectedColumnType === 'DOUBLE' || this.selectedColumnType === 'LONG') {
              this.histogramData.forEach((item,index) => {
                let idx = this.labelsForNumbers.indexOf(item);
                result += this.histogramData.length-1 !== index ? `${this.selectedColumnName} >= ${item} && ${this.selectedColumnName} < ${this.labelsForNumbers[idx+1]} || ` : `${this.selectedColumnName} >= ${item} && ${this.selectedColumnName} < ${this.labelsForNumbers[idx+1]}`;
              })
            } else {
              this.histogramData.forEach((item,index) => {
                result += this.histogramData.length-1 !== index ? this.selectedColumnName + ' == ' +'\''+ item +'\''+ ' || ' : this.selectedColumnName + ' == ' +'\''+ item +'\'';
              })
            }
            rule['ruleString'] = `${command.value} row: ${result}`;
          }
          break;
        case 'generate':
          switch(command.value) {
            case 'derive':
              rule['more'] = { command : 'derive'};
              break;
            case 'duplicate':
              rule['ruleString'] = `derive value: ${this.selectedColumnName} as: ${this.selectedColumnName}_1`;
              break;
            case 'split':
            case 'countpattern':
            case 'extract':
            case 'merge':
            case 'nest':
            case 'unnest':
              rule['more'] = { command : command.value, col : this.originalSelectedCols};
              break;
            case 'flatten':
              rule['ruleString'] = 'flatten col: ' + this.selectedColumnName;
              break;
          }
          break;
      }
      this.applyRuleEvent.emit(rule);
    }

    this.isShow = false;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


}
