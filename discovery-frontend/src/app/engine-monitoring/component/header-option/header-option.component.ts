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
  AfterViewInit,
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {AbstractComponent} from '../../../common/component/abstract.component';
import {DruidClusterInformationComponent} from '../druid-cluster-information/druid-cluster-information.component';

@Component({
  selector: '[header-option]',
  templateUrl: './header-option.component.html',
  host: { '[class.ddp-ui-header-option]': 'true' }
})
export class HeaderOptionComponent extends AbstractComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild(DruidClusterInformationComponent)
  private readonly _druidClusterInformationComponent: DruidClusterInformationComponent;

  public isShowOptionLayer: boolean;

  constructor(protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  public ngOnInit() {
    super.ngOnInit();
  }

  public ngAfterViewInit() {
    super.ngAfterViewInit();
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  public showDruidClusterInformationModal() {
    this._druidClusterInformationComponent.show();
  }

  public toggleOptionLayer() {
    this.isShowOptionLayer = !this.isShowOptionLayer;
  }

  public hide() {
    this._selfHide();
  }

  public clickSetDruidCluster() {
    this._selfHide();
  }

  public clickDruidGuide() {
    this._selfHide();
  }

  private _selfHide() {
    this.isShowOptionLayer = false;
  }
}
