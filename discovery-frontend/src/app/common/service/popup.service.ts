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

import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {SubscribeArg} from '../domain/subscribe-arg';
import {Dashboard, PresentationDashboard} from '@domain/dashboard/dashboard';

@Injectable()
export class PopupService {

  // 공통 전체팝업 Observable
  private popupSource: Subject<SubscribeArg> = new Subject<SubscribeArg>();
  private filterSource: Subject<SubscribeArg> = new Subject<SubscribeArg>();

  // 프레젠테이션 뷰에서 사용하는 데이터
  public ptDashboards: Dashboard[];
  public ptStartDashboard: PresentationDashboard;

  public view$ = this.popupSource.asObservable();
  public filterView$ = this.filterSource.asObservable();

  public notiPopup(data: SubscribeArg) {

    // 공통 전체팝업 호출 알림
    this.popupSource.next(data);
  }

  public notiFilter(data: SubscribeArg) {

    // 공통 전체팝업 호출 알림
    this.filterSource.next(data);
  }

  constructor() {
  }

}
