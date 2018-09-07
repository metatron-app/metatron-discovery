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

import {isUndefined} from "util";
import {Rule} from "../../domain/data-preparation/dataset";

export class PreparationCommonUtil {

  public static removeQuotation(val : string) : string {
    let result = val;
    if (val.startsWith('\'') && val.endsWith('\'')) {
      result = val.substring(1, val.length - 1);
    }
    return result
  }

  public static makeRuleResult(rule: Rule) : string {
    let result = '';
    if(rule.cols) {
      rule.col = rule.cols.join(',')
    }
    switch (rule.command) {
      case 'header':
        result = 'header rownum: ' + rule.rownum;
        break;
      case 'keep':
        result = 'keep row: ' + rule.row;
        break;
      case 'replace':
        result = 'replace col: ' + rule.col + ' with: ' + rule.with + ' on: ' + rule.on + ' global: ' + rule.global + ' ignoreCase: ' + rule.ignoreCase;
        break;
      case 'rename':
        result = 'rename col: ' + rule.col + ' to: ' + rule.to;
        break;
      case 'set':
        result = 'set col: ' + rule.col + ' value: ' + rule.value;
        break;
      case 'settype' :
        result = 'settype col: ' + rule.col + ' type: ' + rule.type;
        if(rule.timestamp) {
          result += ' format: ' + rule.timestamp;
        }
        break;
      case 'setformat':
        result = 'setformat col: ' + rule.col + ' format: ' + rule.timestamp;
        break;
      case 'countpattern':
        result = 'countpattern col: ' + rule.col + ' on: ' + rule.on + ' ignoreCase: ' + rule.ignoreCase;
        break;
      case 'split':
        result = 'split col: ' + rule.col + ' on: ' + rule.on + ' limit: ' + rule.limit + ' ignoreCase: ' + rule.ignoreCase;
        break;
      case 'derive':
        result = 'derive value: ' + rule.value + ' as: ' + rule.as;
        break;
      case 'delete':
        result = 'delete row: ' + rule.row;
        break;
      case 'drop':
        result = 'drop col: ' + rule.col;
        break;
      case 'extract':
        result = 'extract col: ' + rule.col + ' on: ' + rule.on + ' limit: ' + rule.limit + ' ignoreCase: ' + rule.ignoreCase;
        break;
      case 'flatten':
        result = 'flatten col: ' + rule.col;
        break;
      case 'merge':
        result = 'merge col: ' + rule.col + ' with: ' + rule.with + ' as: ' + rule.as;
        break;
      case 'aggregate':
        if(rule.value && rule.value['escapedValue']) {
          rule.value = rule.value['escapedValue']
        }
        result = 'aggregate value: ' + rule.value + ' group: ' + rule.col;
        break;
      case 'splitrows':
        result = 'splitrows col: ' + rule.col + ' on: ' + rule.on;
        if (!isUndefined(rule.quote)) {
          result += ' quote: ' + rule.quote;
        }
        break;
      case 'sort':
        let col = '';
        rule.col ? col = rule.col : col = rule.order.value;
        result = 'sort order: ' + col;

        if (rule.type && rule.type.escapedValue) {
          result = result + ' type:\''+ rule.type.escapedValue + '\'';
        }

        if (rule.type === 'desc') {
          result = result + ' type:\'desc\'';
        }
        break;
      case 'move':
        result = 'move col: ' + rule.col;
        if (rule.beforeOrAfter === 'before') {
          result += ' before: ' + rule.colForMove;
        } else {
          result += ' after: ' + rule.colForMove;
        }
        break;
      case 'pivot':
        if(rule.value && rule.value['escapedValue']) {
          rule.value = rule.value['escapedValue']
        }
        if(rule.groups) {
          rule.group = rule.groups.join(',');
        } else if(rule.group['escapedValue']) {
          rule.group = rule.group['escapedValue'];
        }
        result = 'pivot col: ' + rule.col + ' value: ' + rule.value + ' group: ' + rule.group;
        break;
      case 'unpivot':
        result = 'unpivot col: ' + rule.col + ' groupEvery: ' + rule.groupEvery;
        break;
      case 'nest':
        result = 'nest col: ' + rule.col + ' into: ' + rule.into + ' as: ' + rule.as;
        break;
      case 'unnest':
        result = 'unnest col: ' + rule.col + ' into: ' + rule.into + ' idx: ' + rule.idx;
        break;
      default :
        break;
    }
    if (rule.command === 'replace' || rule.command === 'extract' || rule.command === 'countpattern' || rule.command === 'split') {
      if (rule.quote && '' !== rule.quote.trim() && "''" !== rule.quote.trim()) {
        result += ' quote: ' + rule.quote;
      }
    }

    if (rule.command === 'replace' || rule.command === 'set') {
      if (rule.row && '' !== rule.row.trim() && "''" !== rule.row.trim()) {
        result += ' row: ' + rule.row;
      }
    }

    return result;
  }
}
