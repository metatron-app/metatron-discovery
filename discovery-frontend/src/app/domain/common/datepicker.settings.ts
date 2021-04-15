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

export class PickerSettings {
  public class: string;
  public language: string = 'en';
  public minView: string;
  public view: string;
  public position: string = 'bottom left';
  public dateFormat: string;
  public timeFormat: string;
  public timepicker: boolean = false;
  public onSelect: (fdate: string, date: Date) => void;
  public onHide: (inst, completed: boolean) => void;

  constructor(clz: string, onSelectDate: (fdate: string, date: Date) => void, onHide: (inst, completed: boolean) => void) {
    this.class = clz;
    this.onSelect = onSelectDate;
    this.onHide = onHide;
    this.dateFormat = 'yyyy-mm-dd';
    this.timeFormat = 'hh:ii';
  }

} // structure - PickerSettings
