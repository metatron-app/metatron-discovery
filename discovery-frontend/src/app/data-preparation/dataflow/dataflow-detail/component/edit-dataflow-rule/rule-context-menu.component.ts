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
  // Context menu show/hide
  public isShow : boolean = false;

  // Already selected column ids (before context menu is clicked)
  public originalSelectedColIds : string[];

  public histogramData : any;
  public labelsForNumbers : any;
  public commandList : any;
  public isColumnSelect : boolean = false;

  public contextInfo : any;
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
  public openContextMenu(data : {contextInfo : any , fields : string[], selectedColumnIds : string[], params : any}) {

    this.broadCaster.broadcast('EDIT_RULE_SHOW_HIDE_LAYER', { isShow : false } );

    this.contextInfo = data.contextInfo;
    this.contextInfo.fields = data.fields;
    this.contextInfo.top += 'px';
    this.contextInfo.left += 'px';

    this.labelsForNumbers = data.params.labels;
    this.histogramData = data.params.values;
    this.isColumnSelect = data.params.isColumnSelect;

    this.originalSelectedColIds = data.selectedColumnIds;

    if (data.params.selected) {
      this.originalSelectedColIds = data.params.selected ;
    }

    // Check if settype rule should be disabled or not
    let indexArray = [];
    data.selectedColumnIds.forEach((item) => {
      if (-1 !== data.fields.indexOf(item) ) {
        indexArray.push(data.fields.indexOf(item));
      }
    });

    let isAllTimestampTypes = false;
    if (indexArray.length !== 0 && indexArray.length > 1) {
      indexArray.forEach((item) => {
        if (this.contextInfo.gridResponse.colDescs[item].type === 'TIMESTAMP'){
          isAllTimestampTypes = true;
        }
      })
    }

    let isSetformatDisable = false;
    if (indexArray.length !== 0 && indexArray.length > 1) {
      indexArray.forEach((item) => {
        if (this.contextInfo.gridResponse.colDescs[item].type !== 'TIMESTAMP'){
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
              {label : 'Timestamp', value : 'Timestamp', command : 'settype', disabled : this.originalSelectedColIds.length === 1? this.contextInfo.columnType === 'TIMESTAMP' : isAllTimestampTypes },
              {label : 'String', value : 'String', command : 'settype'}
            ]
          },
          {label : 'Set format', value : 'setformat', command: 'setformat', disabled : this.originalSelectedColIds.length === 1? this.contextInfo.columnType !== 'TIMESTAMP' : isSetformatDisable },
          {label : 'Column name', value : 'rename', command: 'rename' }
        ]
      },
      {label : 'Edit', value: 'edit', iconClass: 'ddp-icon-drop-editmodify' , command: 'edit',
        children : [
          {label : 'Replace', value : 'replace', command: 'edit'},
          {label : 'Set', value : 'set', command: 'edit'},
          {label : 'Keep', value : 'keep', command: 'edit', disabled : (!data.params.clickable) || (this.contextInfo.columnType === 'MAP' || this.contextInfo.columnType === 'ARRAY')},
          {label : 'Delete', value : 'delete', command: 'edit', disabled : (!data.params.clickable) || (this.contextInfo.columnType === 'MAP' || this.contextInfo.columnType === 'ARRAY')}
        ]
      },
      {label : 'Generate', value: 'generate', iconClass: 'ddp-icon-drop-generate' , command: 'generate',
        children : [
          {label : 'Duplicate', value : 'duplicate', command: 'generate'},
          {label : 'Derive', value : 'derive', command: 'generate'},
          {label : 'Split', value : 'split', command: 'generate'},
          {label : 'Extract', value : 'extract', command: 'generate'},
          {label : 'Count pattern', value : 'countpattern', command: 'generate'},
          {label : 'Merge', value : 'merge' , disabled : (data.selectedColumnIds.length === 1 && data.selectedColumnIds[0] === data.contextInfo.columnName) || data.selectedColumnIds.length === 0, command: 'generate'},
          {label : 'Nest', value : 'nest', disabled : (data.selectedColumnIds.length === 1 && data.selectedColumnIds[0] === data.contextInfo.columnName) || data.selectedColumnIds.length === 0, command: 'generate'},
          {label : 'Unnest', value : 'unnest', disabled : this.contextInfo.columnType !== 'ARRAY' && this.contextInfo.columnType !== 'MAP', command: 'generate'},
          {label : 'Flatten', value : 'flatten' , disabled : this.contextInfo.columnType !== 'ARRAY', command: 'generate'},

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

  public changeUUIDtoNames(items : string[]) : string[] {

    let result : string[] = [];
    items.forEach((item) => {
      result.push(this.contextInfo.gridResponse.colNames[this.contextInfo.fields.indexOf(item)]);
    });
    return result;
  }

  public _selectCommand(command) {

    if (!(command.children && 0 < command.children.length)) { // 하위 메뉴가 있으면 클릭 불가

      // change coluuid list to col name list
      let columnNames = this.changeUUIDtoNames(this.originalSelectedColIds);
      const columnsStr: string = columnNames.map((item) => {
        if (-1 !== item.indexOf(' ')) {
          item = '`' + item + '`';
        }
        return item
      }).join(', ');

      const selCol = -1 !== this.contextInfo.columnName.indexOf(' ') ?  '`' + this.contextInfo.columnName + '`' : this.contextInfo.columnName;

      let rule = {};
      switch(command.command) {
        case 'rename':
          rule['more'] = { command : 'rename', col : {value : this.contextInfo.columnId}};
          break;
        case 'drop':
          if (this.contextInfo.gridResponse.colNames.length === 1) { // at least one column must exist
            Alert.warning('Cannot delete all columns');
            return;
          }
          rule['ruleString'] = command.value + ' col: ' + columnsStr;
          break;
        case 'settype':
          switch(command.value) {
            case 'Long':
            case 'Double':
            case 'Boolean':
              rule['ruleString'] = 'settype col: ' + columnsStr + ' type: ' + command.value;
              break;
            case 'String':
              if(this.contextInfo.columnType.toUpperCase() === 'TIMESTAMP') {
                // timestamp 타입일 때 string으로 바꾼다면 .
                rule['more'] = { command : 'settype', col :  {value : this.originalSelectedColIds}, type : command.value};
              } else {
                rule['ruleString'] = 'settype col: ' + columnsStr + ' type: ' + command.value;
              }
              break;
            case 'Timestamp':
              rule['more'] = { command : 'settype', col :  {value : this.originalSelectedColIds}, type : command.value};
              break;
          }
          break;
        case 'setformat':
          rule['more'] = { command : 'setformat', col : this.originalSelectedColIds, type : command.value};
          break;
        case 'sort':
          rule['ruleString'] = 'sort order: ' + columnsStr;
          if (command.value === 'desc') {
            rule['ruleString'] += ' type:\'desc\'';
          }
          break;
        case 'move':
          if (command.value === 'first') {
            let first = -1 !== this.contextInfo.gridResponse.colNames[0].indexOf(' ') ?  '`' + this.contextInfo.gridResponse.colNames[0] + '`' : this.contextInfo.gridResponse.colNames[0];
            rule['ruleString'] = `move col: ${columnsStr} before: ${first}`;
          } else if (command.value === 'last') {
            let last = this.contextInfo.gridResponse.colNames[this.contextInfo.gridResponse.colNames.length-1];
            last = -1 !== last.indexOf(' ') ? '`' + last + '`' : last;
            rule['ruleString'] = `move col: ${columnsStr} after: ${last}`;
          } else if (command.value === 'before' || command.value === 'after') {
            rule['more'] = {command : 'move', col : {value : columnNames}};
            rule['more'][command.value] = '';
          }
          break;
        case 'edit':
          if (command.value === 'replace' || command.value === 'set') {
            rule['more'] = { command : command.value, col : {value :  this.originalSelectedColIds}};
          } else if (command.value === 'keep' || command.value === 'delete') {
            let result = '';
            if (this.isColumnSelect) {
              let list = [];
              this.histogramData.forEach((item) => {
                if ('matched' === item) {
                  list.push(`!ismismatched(${selCol},'${this.contextInfo.columnType}')`)
                } else if ('missing' === item) {
                  list.push( `ismissing(${selCol})`)
                } else if ('mismatched' === item) {
                  list.push(`ismismatched(${selCol},'${this.contextInfo.columnType}')`)
                }
              });
              result = list.join(' && ');
            } else if (this.contextInfo.columnType === 'DOUBLE' || this.contextInfo.columnType === 'LONG') {
              this.histogramData.forEach((item,index) => {
                let idx = this.labelsForNumbers.indexOf(item);
                result += this.histogramData.length-1 !== index ? `${selCol} >= ${item} && ${this.contextInfo.columnName} < ${this.labelsForNumbers[idx+1]} || ` : `${selCol} >= ${item} && ${selCol} < ${this.labelsForNumbers[idx+1]}`;
              })
            } else {
              this.histogramData.forEach((item,index) => {
                result += this.histogramData.length-1 !== index ? selCol + ' == ' +'\''+ item +'\''+ ' || ' : selCol + ' == ' +'\''+ item +'\'';
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
              let newCol = `${this.contextInfo.columnName}_1`;
              if (this.contextInfo.columnName.indexOf(' ') !== -1) {
                newCol = '`'+ newCol + '`';
              }
              rule['ruleString'] = `derive value: ${selCol} as: ${newCol}`;
              break;
            case 'split':
            case 'countpattern':
            case 'extract':
            case 'merge':
            case 'nest':
            case 'unnest':
              rule['more'] = { command : command.value, col : { value : this.originalSelectedColIds}};
              break;
            case 'flatten':
              rule['ruleString'] = 'flatten col: ' + selCol;
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
