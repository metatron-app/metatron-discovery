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

class LocalStorageKey {
  // 사용자가 최근 사용한 조건들(정렬, 뷰 종류, 북 종류 등등)
  public USED_CRITERIA = 'USED_CRITERIA';
  public USER_SETTING = 'USER_SETTING';
  public ENGINE_MONITORING = 'ENGINE_MONITORING';
}

export class LocalStorageConstant {
  public static KEY: LocalStorageKey = new LocalStorageKey();
}
