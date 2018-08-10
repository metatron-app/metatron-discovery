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

package app.metatron.discovery.domain.workbook.configurations;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;

import app.metatron.discovery.util.EnumUtils;

/**
 * 필드 정렬 정의
 *
 */
public class Sort implements Serializable {

  /**
   *  정렬 대상 필드명 pivot 또는 projction 에 선언된 필드만 위치해야함 <br/>
   *  필드 alias 위치
   */
  String field;

  /**
   * 정렬 방향, 기본값은 ASC
   */
  Direction direction;

  public Sort() {
    // Empty Constructor
  }

  @JsonCreator
  public Sort(@JsonProperty("field") String field,
              @JsonProperty("direction") String direction) {
    this.field = field;
    this.direction = EnumUtils.getUpperCaseEnum(Direction.class, direction, Direction.ASC);
  }

  public Sort(String field, Direction direction) {
    this.field = field;
    this.direction = direction;
  }

  public String getField() {
    return field;
  }

  public void setField(String field) {
    this.field = field;
  }

  public Direction getDirection() {
    return direction;
  }

  public void setDirection(Direction direction) {
    this.direction = direction;
  }

  public enum Direction{
    ASC, DESC
  }
}
