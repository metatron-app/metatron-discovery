
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

/*
* COOKIE KEY
*/

class CookieKey {

  // 로그인 토큰
  public LOGIN_TOKEN = 'LOGIN_TOKEN';

  // 로그인 토큰
  public LOGIN_TOKEN_TYPE = 'LOGIN_TOKEN_TYPE';

  // 리프레쉬 토큰
  public REFRESH_LOGIN_TOKEN = 'REFRESH_LOGIN_TOKEN';

  // 로그인 유저정보
  public LOGIN_USER_ID = 'LOGIN_USER_ID';

  // 워크북화면 대시보드 목록 접힙 여부
  public WORKBOOK_CLOSE_DASHBOARD_LIST = 'WORKBOOK_CLOSE_DASHBOARD_LIST';

  // 아이디 저장
  public SAVE_USER_ID = 'SAVE_USER_ID';

  // 현재 워크스페이스 정보
  public CURRENT_WORKSPACE = 'CURRENT_WORKSPACE';

  // 내 워크스페이스 정보
  public MY_WORKSPACE = 'MY_WORKSPACE';

  // 접속한 사용자의 퍼미션
  public PERMISSION = 'PERMISSION';

}

/*
* COOKIE CONSTANT SUMMARY
*/

export class CookieConstant {

  // COOKIE KEY
  public static KEY: CookieKey = new CookieKey();

}
