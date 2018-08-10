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

package app.metatron.discovery.domain.workbook;

import com.google.common.collect.Maps;

import java.util.Map;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.workbook.configurations.BoardConfiguration;
import app.metatron.discovery.domain.workbook.widget.Widget;

/**
 * 테스트용 Page 모델 Builder
 */
public class DashBoardBuilder {

  private Map<String, Object> dashBoard = Maps.newHashMap();

  private boolean toJson = false;

  public DashBoardBuilder name(String name) {
    dashBoard.put("name", name);
    return this;
  }

  public DashBoardBuilder description(String description) {
    dashBoard.put("description", description);
    return this;
  }

  public DashBoardBuilder temporaryId(String temporaryId) {
    dashBoard.put("temporaryId", temporaryId);
    return this;
  }

  public DashBoardBuilder configuration(BoardConfiguration configuration) {
    dashBoard.put("configuration", configuration);
    return this;
  }

  public DashBoardBuilder widgets(Widget... widgets) {
    return this;
  }

  public DashBoardBuilder workbook(String workbookId) {
    dashBoard.put("workBook", "/api/workbooks/" + workbookId);
    return this;
  }

  public DashBoardBuilder toJson(boolean toJson) {
    this.toJson = true;
    return this;
  }

  public Object build() {
    if(toJson) {
      return GlobalObjectMapper.writeValueAsString(dashBoard);
    } else {
      return dashBoard;
    }
  }

}
