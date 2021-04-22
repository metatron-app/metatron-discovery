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

import {
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {AbstractPopupComponent} from '@common/component/abstract-popup.component';
import {StringUtil} from '@common/util/string.util';
import {TextWidget} from '@domain/dashboard/widget/text-widget';
import {TextWidgetEditorComponent} from './editor/text-widget-editor.component';

@Component({
  selector: 'app-update-text',
  templateUrl: './text-widget.update.component.html',
  styleUrls: ['./text-widget.component.css']
})
export class TextWidgetUpdateComponent extends AbstractPopupComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild('editor', {static: true})
  private editor: TextWidgetEditorComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public isShow: boolean = false;

  public widget: TextWidget;

  // ------------------------------
  // Input List
  // ------------------------------

  @Input('widget')
  set setWidget(widget: TextWidget) {
    this.widget = widget;
  }

  @Input()
  public readonly: boolean = false;

  @Input()
  public placeholder: string = '';

  @Output('change')
  public changedWidgetEvent: EventEmitter<{ name: string, widget: TextWidget }> = new EventEmitter();

  /**
   * 에디터 옵션
   * @returns {Object}
   */
  public get editorOptions(): object {

    const editorOptions = {
      placeholder: this.placeholder,
      readOnly: this.readonly,
      bounds: this.elementRef.nativeElement
    };

    // 읽기 전용인 경우는 툴바 hidden
    if (this.readonly) {
      const disableToolbar = {
        modules: {
          toolbar: false
        }
      };

      Object.assign(editorOptions, disableToolbar);
    }

    return editorOptions;
  } // get - editorOptions

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit(): void {
    super.ngOnInit();
    if (this.widget) {
      this.editor.setContent(this.widget.configuration['contents']);
    } else {
      this.editor.init();
    }
  }

  // Destory
  public ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 에디터 생성 완료 콜백 이벤트
   */
  public editorCreated(): void {
    this.isShow = true;
  }

  /**
   * 변경사항을 배포한다.
   */
  public done(): void {

    if (this.readonly === false) {

      let publishInfo: { name: string, widget: TextWidget };

      // 반환해줄 에디터 내용
      const html: string = StringUtil.isEmpty(this.editor.getContent()) ? '' : this.editor.getContent();

      if (this.widget) {
        this.widget.configuration['contents'] = html;
        publishInfo = {
          name: 'UPDATE',
          widget: this.widget
        };
      } else {
        publishInfo = {
          name: 'CREATE',
          widget: (new TextWidget(html))
        };
      }

      this.changedWidgetEvent.emit(publishInfo);

      this.isShow = false;
    }
  } // function - done

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Editor Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
