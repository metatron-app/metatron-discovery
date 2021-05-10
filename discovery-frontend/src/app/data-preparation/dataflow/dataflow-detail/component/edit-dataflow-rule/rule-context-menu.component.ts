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

import * as _ from 'lodash';
import { Component, ElementRef, EventEmitter, Injector, OnDestroy, OnInit, Output } from '@angular/core';
import { Alert } from '@common/util/alert.util';
import { EventBroadcaster } from '@common/event/event.broadcaster';
import { AbstractComponent } from '@common/component/abstract.component';

@Component({
  selector: 'app-rule-context-menu',
  templateUrl: './rule-context-menu.component.html',
})
export class RuleContextMenuComponent extends AbstractComponent implements OnInit, OnDestroy{


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @Output()
  private contextMenuItemClick = new EventEmitter();
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

    this.broadCaster.broadcast('EDIT_RULE_SHOW_HIDE_LAYER', {id:'toggleList', isShow : false } );

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
    const indexArray = [];
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

    let isAllStringTypes = false;
    if (indexArray.length !== 0) {
      indexArray.forEach((item) => {
        if (this.contextInfo.gridResponse.colDescs[item].type === 'STRING'){
          isAllStringTypes = true;
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
              {label : 'String', value : 'String', command : 'settype'},
              {label : 'Map', value : 'Map', command : 'settype', disabled : !isAllStringTypes },
              {label : 'Array', value : 'Array', command : 'settype', disabled : !isAllStringTypes },
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
      },
      {label : 'Clean', value: 'clean', iconClass: 'ddp-icon-drop-clean' , command: 'clean', disabled : this.originalSelectedColIds.length > 1,
        children : [
          {label : 'Mismatch', value : 'mismatch', command : 'mismatch'
            , children : [
              {label : 'Delete rows', value : 'direct-mismatch', command : 'clean'},
              {label : 'Replace with custom value', value : 'mismatch', command : 'clean'}
              ]
          },
          {label : 'Missing', value : 'last', command : 'move'
            , children : [
              {label : 'Delete rows', value : 'direct-missing', command : 'clean'},
              {label : 'Fill with custom value', value : 'missing', command : 'clean'}
              ]
          },
        ]
      }

    ];
    this.isShow = true;
  }

  public changeUUIDtoNames(items : string[]) : string[] {

    const result : string[] = [];
    items.forEach((item) => {
      result.push(this.contextInfo.gridResponse.colNames[this.contextInfo.fields.indexOf(item)]);
    });
    return result;
  }

  public _selectCommand(command) {

    if (!(command.children && 0 < command.children.length)) { // 하위 메뉴가 있으면 클릭 불가

      // change coluuid list to col name list
      const columnNames = this.changeUUIDtoNames(this.originalSelectedColIds);
      const columnNamesWithBackTick: string = this._getColumnNamesInArray(columnNames, true).toString();

      const selCol = '`' + this.contextInfo.columnName + '`';

      let rule: ContextMenuParam = new ContextMenuParam();
      switch(command.command) {

        case 'rename':

          rule.more = { command : 'rename', col : [this.contextInfo.columnId]};
          break;

        case 'drop':

          rule = this._setDropParam(rule, columnNamesWithBackTick, columnNames);
          if (_.isNil(rule)) {
            return;
          }
          break;

        case 'settype':

          rule = this._setSetTypeParam(command.value, rule, columnNamesWithBackTick, columnNames);
          break;

        case 'setformat':

          rule.more = { command : 'setformat', col : this.originalSelectedColIds, type : command.value};
          break;

        case 'sort':

          rule = this._setSortParam(command.value === 'desc', rule, columnNamesWithBackTick, columnNames );
          break;

        case 'move':

          rule = this._setMoveParam(command.value, rule, columnNamesWithBackTick, columnNames);
          break;

        case 'edit':

          if (command.value === 'replace') {
            rule['more'] = { command : command.value, col : this.originalSelectedColIds};
          }

          if (command.value === 'set') {
            rule = this._setSetParam(command.value, rule);
          }

          if (command.value === 'keep' || command.value === 'delete') {
            rule = this._setKeepDeleteParam(command.value, rule);
          }
          break;

        case 'generate':
          switch(command.value) {
            case 'derive':
              rule['more'] = { command : 'derive', col: []};
              break;
            case 'duplicate':
              const newCol = `${this.contextInfo.columnName}_1`;
              rule.ruleString = `derive value: ${selCol} as: \`${newCol}\``;
              rule.uiRuleString = {name: 'derive', expression: this.contextInfo.columnName ,newCol: newCol, isBuilder: true };
              break;
            case 'flatten':
              rule.ruleString = 'flatten col: ' + selCol;
              rule.uiRuleString = {name: 'flatten', col: [this.contextInfo.columnName], isBuilder: true};
              break;
            default:
              rule['more'] = { command : command.value, col : this.originalSelectedColIds};
              break;
          }
          break;
        case 'clean':
          rule.ruleString = `delete row: `;
          const res = [];
          switch(command.value) {

            case 'direct-mismatch':
              columnNames.forEach((item) => {
                res.push('ismismatched(' + '`' + item + '`' + `,'${this.contextInfo.columnType}')`);
              });

              rule.ruleString += res.join(' || ');
              rule.uiRuleString = {name: 'delete', condition : res.join(' || '), isBuilder: true};
              break;
            case 'direct-missing':
              // delete row: isnull(c) || isnull(`space col`)
              columnNames.forEach((item) => {
                res.push('isnull(' + '`' + item + '`' + ')');
              });

              rule.ruleString += res.join(' || ');
              rule.uiRuleString = {name: 'delete', condition : res.join(' || '), isBuilder: true};
              break;

            case 'mismatch':
              rule['more'] = {contextMenu : true,  command : 'set', col : this.originalSelectedColIds, condition : `ismismatched(${selCol},'${this.contextInfo.columnType}')`};
              break;
            case 'missing':
              rule['more'] = {contextMenu : true, command : 'set', col : this.originalSelectedColIds, condition : `ismissing(${selCol})`};
              break;
          }
          break;
      }
      this.contextMenuItemClick.emit(rule);
    }

    this.isShow = false;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Make drop param
   * @param rule
   * @param colStr
   * @param colNames
   * @private
   */
  private _setDropParam(rule: ContextMenuParam, colStr: string, colNames: string[]) {
    if (this.contextInfo.gridResponse.colNames.length === 1) { // at least one column must exist
      Alert.warning('Cannot delete all columns');
      return undefined;
    }
    rule.ruleString = `drop col: ${colStr}`;
    rule.uiRuleString = {name:'drop', col: colNames, isBuilder: true};
    return rule;
  }


  /**
   * Make settype param
   * @param type
   * @param rule
   * @param columnStr
   * @param columnNames
   * @private
   */
  private _setSetTypeParam(type: string, rule: ContextMenuParam, columnStr: string, columnNames: string[]) {

    if (
      (type === 'String' && this.contextInfo.columnType.toUpperCase() === 'TIMESTAMP')
      || 'Timestamp' === type
    ) {
      rule.more = { command : 'settype', col : this.originalSelectedColIds, type : type};
    } else {
      rule.ruleString = 'settype col: ' + columnStr + ' type: ' + type.toLowerCase();
      rule.uiRuleString = {name: 'settype', col:columnNames, type: type, isBuilder: true}
    }

    return rule;

  }


  /**
   * Make sort param
   * @param isDesc
   * @param rule
   * @param columnStr
   * @param columnNames
   * @private
   */
  private _setSortParam(isDesc: boolean, rule: ContextMenuParam, columnStr: string, columnNames: string[]) {

    rule.ruleString = 'sort order: ' + columnStr;
    rule.uiRuleString = {name: 'sort', col: columnNames, sortBy: 'asc', isBuilder: true};
    if (isDesc) {
      rule.ruleString += ' type:\'desc\'';
      rule.uiRuleString['sortBy'] = 'desc';
    }

    return rule;
  }


  /**
   * Make move param
   * @param type
   * @param rule
   * @param columnStr
   * @param columnNames
   * @private
   */
  private _setMoveParam(type: string, rule: ContextMenuParam, columnStr: string, columnNames: string[]) {

    if (type === 'first') {
      const first = this.contextInfo.gridResponse.colNames[0];
      rule.ruleString = `move col: ${columnStr} before: \`${first}\``;
      rule.uiRuleString = {
        beforeAfter: 'before',
        refColumn: first,
      }
    }

    if (type === 'last') {
      const last = this.contextInfo.gridResponse.colNames[this.contextInfo.gridResponse.colNames.length-1];
      rule.ruleString = `move col: ${columnStr} after: \`${last}\``;
      rule.uiRuleString = {
        beforeAfter: 'after',
        refColumn: last,
      }
    }

    if (rule.uiRuleString && rule.uiRuleString.beforeAfter) {
      rule.uiRuleString.name =  'move';
      rule.uiRuleString.col =  columnNames;
      rule.uiRuleString.isBuilder = true;
    }

    if (type === 'before' || type === 'after') {
      rule['more'] = {command : 'move', col : columnNames, beforeAfter: type};
    }

    return rule;
  }


  /**
   * Make set param
   * @param command
   * @param rule
   * @private
   */
  private _setSetParam(command: string, rule: ContextMenuParam) {
    const colName: string = this.contextInfo.columnName;
    const colType: string = this.contextInfo.columnType;
    let result = '';
    if (this.isColumnSelect) {
      const list = [];
      this.histogramData.forEach((item) => {
        if ('matched' === item) {
          list.push(`!ismismatched(\`${colName}\`,'${colType}') && !isNull(\`${colName}\`)`)
        } else if ('missing' === item) {
          list.push( `ismissing(\`${colName}\`)`)
        } else if ('mismatched' === item) {
          list.push(`ismismatched(\`${colName}\`,'${colType}')`)
        }
      });
      result = list.join(' && ');
    } else if (colType === 'DOUBLE' || colType === 'LONG') {
      this.histogramData.forEach((item,index) => {
        const idx = this.labelsForNumbers.indexOf(item);
        result += this.histogramData.length-1 !== index ? `\`${colName}\` >= ${item} && \`${colName}\` < ${this.labelsForNumbers[idx+1]} || ` : `\`${colName}\` >= ${item} && \`${colName}\` < ${this.labelsForNumbers[idx+1]}`;
      })
    } else if (colType === 'TIMESTAMP') {
      this.histogramData.forEach((item,index) => {
        const idx = this.labelsForNumbers.indexOf(item);
        result += this.histogramData.length-1 !== index ? `time_between(\`${colName}\`,'${this.contextInfo.timestampStyle[idx]}','${this.contextInfo.timestampStyle[idx+1]}') || ` : `time_between(\`${colName}\`,'${this.contextInfo.timestampStyle[idx]}','${this.contextInfo.timestampStyle[idx+1]}')`;
      });
    } else {
      if(this.histogramData) {
        this.histogramData.forEach((item,index) => {
          result += this.histogramData.length-1 !== index ? '`'+ colName + '`' + ' == ' +'\''+ item +'\''+ ' || ' : '`' + colName + '`' + ' == ' +'\''+ item +'\'';
        })
      }
    }

    if( result==='' ) {
      rule.more = { command : command, col : this.originalSelectedColIds };
    } else {
      rule.more = { command : command, col : this.originalSelectedColIds, condition : result, contextMenu : true };
      rule.ruleString = `${command} row: ${result}`;
      rule.uiRuleString = {name: command, condition: result, isBuilder: true};
    }
    return rule;
  }

  /**
   * Make keep or delete param
   * @param command
   * @param rule
   * @private
   */
  private _setKeepDeleteParam(command: string, rule: ContextMenuParam) {
    const colName: string = this.contextInfo.columnName;
    const colType: string = this.contextInfo.columnType;
    let result = '';
    if (this.isColumnSelect) {
      const list = [];
      this.histogramData.forEach((item) => {
        if ('matched' === item) {
          list.push(`!ismismatched(\`${colName}\`,'${colType}') && !isNull(\`${colName}\`)`)
        } else if ('missing' === item) {
          list.push( `ismissing(\`${colName}\`)`)
        } else if ('mismatched' === item) {
          list.push(`ismismatched(\`${colName}\`,'${colType}')`)
        }
      });
      result = list.join(' && ');
    } else if (colType === 'DOUBLE' || colType === 'LONG') {
      this.histogramData.forEach((item,index) => {
        const idx = this.labelsForNumbers.indexOf(item);
        result += this.histogramData.length-1 !== index ? `\`${colName}\` >= ${item} && \`${colName}\` < ${this.labelsForNumbers[idx+1]} || ` : `\`${colName}\` >= ${item} && \`${colName}\` < ${this.labelsForNumbers[idx+1]}`;
      })
    } else if (colType === 'TIMESTAMP') {
      this.histogramData.forEach((item,index) => {
        const idx = this.labelsForNumbers.indexOf(item);
        result += this.histogramData.length-1 !== index ? `time_between(\`${colName}\`,'${this.contextInfo.timestampStyle[idx]}','${this.contextInfo.timestampStyle[idx+1]}') || ` : `time_between(\`${colName}\`,'${this.contextInfo.timestampStyle[idx]}','${this.contextInfo.timestampStyle[idx+1]}')`;
      });
    } else {
      this.histogramData.forEach((item,index) => {
        result += this.histogramData.length-1 !== index ? '`'+ colName + '`' + ' == ' +'\''+ item +'\''+ ' || ' : '`' + colName + '`' + ' == ' +'\''+ item +'\'';
      })
    }

    rule.ruleString = `${command} row: ${result}`;
    rule.uiRuleString = {name: command, condition: result, isBuilder: true};
    return rule;
  }


  /**
   * Make columns into array
   * @param fields
   * @param isWrap
   * @private
   */
  private _getColumnNamesInArray(fields: any, isWrap:boolean = false) :string[] {
    return fields.map((item) => {
      if (isWrap) {
        return '`' + item + '`'
      } else {
        return item
      }
    });
  }

}

class ContextMenuParam {
  public more?:any;
  public ruleString?: string;
  public uiRuleString?: any;
}
