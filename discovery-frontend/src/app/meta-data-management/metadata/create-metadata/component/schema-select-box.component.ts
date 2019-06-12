/*
 *
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

import {AbstractComponent} from "../../../../common/component/abstract.component";
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Injector,
  Input,
  Output,
} from "@angular/core";
import * as _ from 'lodash';
import {StringUtil} from "../../../../common/util/string.util";
import {CommonUtil} from "../../../../common/util/common.util";

@Component({
  selector: 'schema-select-box',
  templateUrl: 'schema-select-box.component.html'
})
export class SchemaSelectBoxComponent extends AbstractComponent {

  @Input() readonly isDisableSelect: boolean;
  @Input() readonly isEnableWindowResizeAutoClose: boolean;
  @Input() readonly isEnableSearch: boolean;
  @Input() readonly isEnableAutoShowList: boolean;

  @Input() readonly schemaList: string[];
  @Input() selectedSchema: string;
  @Input() searchKeyword: string;

  @Input() readonly unselectedMessage: string = this.translateService.instant('msg.storage.ui.dsource.create.choose-schema');
  @Input() readonly searchPlaceHolder: string = this.translateService.instant('msg.storage.ui.dsource.create.search-schema');

  @Input() readonly listOptionClass: string = 'ddp-selectdown';

  // event output
  @Output() readonly changedSchema = new EventEmitter();

  readonly SEARCH_INPUT_ELEMENT: string = CommonUtil.getUUID() + '-search-input-elm';

  isShowList: boolean;

  constructor(protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  ngOnInit() {
    super.ngOnInit();
    this.pageResult.number = 0;
    this.pageResult.size = 20;
  }

  ngAfterViewInit() {
    if (this.isEnableAutoShowList && this.isEmptySelectedSchema()) {
      setTimeout(() => { this.isShowList = true})
    }
  }

  /**
   * Window resize
   * @param event
   */
  @HostListener('window:resize', ['$event'])
  protected onResize(event) {
    // #1925
    if (this.isEnableWindowResizeAutoClose && this.isShowList) {
      this.isShowList = false;
    }
  }

  get getSchemaList(): string[] {
    let result = this.schemaList;
    // search
    if (this.isEnableSearch && StringUtil.isNotEmpty(this.searchKeyword)) {
      result = result.filter(schema => schema.includes(this.searchKeyword));
    }
    // paging
    // if (this.isEnablePaging) {
    //   result = result.slice(0, (this.pageResult.number + 1) * this.pageResult.size);
    // }
    return result;
  }

  closeList(): void {
    this.isShowList = false;
  }

  isEmptySchemaList(): boolean {
    return _.isNil(this.schemaList) || this.schemaList.length === 0;
  }

  isEmptySelectedSchema(): boolean {
    return _.isNil(this.selectedSchema);
  }

  onChangeShowList(event: MouseEvent): void {
    if (!this.isDisableSelect && !event.target['classList'].contains(this.SEARCH_INPUT_ELEMENT)) {
      this.isShowList = !this.isShowList;
    }
  }

  onChangeSelectedSchema(schema: string): void {
    if (this.isEmptySelectedSchema() || this.selectedSchema !== schema) {
      this.selectedSchema = schema;
      // output event
      this.changedSchema.emit(schema);
    }
  }

  onChangeSearchKeyword(keyword: string): void {
    this.searchKeyword = keyword;

  }

  onScrollList(): void {
    this.pageResult.number++;
  }
}
