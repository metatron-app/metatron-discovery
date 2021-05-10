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

import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'trend-line-component',
  templateUrl: './trend.line.component.html'
})
export class TrendLineComponent implements OnInit {

  @Input('dataSubLayerKey')
  public dataSubLayerKey: string = '';

  constructor() {
  }

  ngOnInit() {
  }

  /**
   * 데이터 서브 패널 클릭시 show hide 처리
   */
  public clickDataSubPanel(dataSubLayerKey: string, event?: Event) {

    // 이벤트 전파 방지
    event.stopPropagation();
    event.preventDefault();

    // 같은 값인경우 초기화
    if (JSON.stringify(this.dataSubLayerKey) === JSON.stringify(dataSubLayerKey)) {

      this.dataSubLayerKey = '';
    } else {

      // 해당 패널의 key값 설정
      this.dataSubLayerKey = dataSubLayerKey;
    }
  }

}
