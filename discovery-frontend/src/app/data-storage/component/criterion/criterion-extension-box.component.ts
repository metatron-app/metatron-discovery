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


import {Component, ElementRef, EventEmitter, Injector, Input, Output} from "@angular/core";
import {Criteria} from "../../../domain/datasource/criteria";
import {AbstractComponent} from "../../../common/component/abstract.component";

@Component({
  selector: 'criterion-extension-box',
  templateUrl: 'criterion-extension-box.component.html',
  host: {
    '(document:click)': 'onClickHost($event)',
  }
})
export class CriterionExtensionBoxComponent extends AbstractComponent {
  // 여기서는 extension criterion의 이벤트 전파만 담당
  // 실질적인 관리는 criterion.component에서 전담한다

  @Input()
  public readonly usedCriterionList: Criteria.ListCriterion[];
  @Input()
  public readonly criterionList: Criteria.ListCriterion[];

  @Output()
  public readonly removeCriterionEvent = new EventEmitter();
  @Output()
  public readonly addCriterionEvent = new EventEmitter();

  public isShowList: boolean;

  // constructor
  constructor(protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }


  public isCheckedCriterion(criterion: Criteria.ListCriterion): boolean {
    return this.usedCriterionList.findIndex(usedCriterion => usedCriterion.criterionKey === criterion.criterionKey) !== -1;
  }

  /**
   * Select box outside click event
   * @param event
   */
  public onClickHost(event) {
    // 현재 element 내부에서 생긴 이벤트가 아닌경우 hide 처리
    if (!this.elementRef.nativeElement.contains(event.target)) {
      // close list
      this.isShowList = false;
    }
  }

  public onChangeCheckedCriterion(criterion: Criteria.ListCriterion): void {
    // if used criterion
    if (this.isCheckedCriterion(criterion)) {
      this.removeCriterionEvent.emit(criterion);
    } else {  // if not used criterion
      this.addCriterionEvent.emit(criterion);
    }
  }
}
