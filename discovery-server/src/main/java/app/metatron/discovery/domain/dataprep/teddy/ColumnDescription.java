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

package app.metatron.discovery.domain.dataprep.teddy;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

public class ColumnDescription implements Serializable {
  private ColumnType type;
  private String timestampStyle;
  private List<ColumnDescription> arrColDesc;
  private Map<String, ColumnDescription> mapColDesc;

  public ColumnDescription() {
    type = ColumnType.UNKNOWN;
    timestampStyle = null;
    arrColDesc = null;
    mapColDesc = null;
  }

  public ColumnDescription(ColumnType type, String timestampStyle) {
    super();
    this.type = type;
    this.timestampStyle = timestampStyle;
  }

  public ColumnType getType() {
    return type;
  }

  public void setType(ColumnType type) {
    this.type = type;
  }

  public String getTimestampStyle() {
    return timestampStyle;
  }

  public void setTimestampStyle(String timestampStyle) {
    this.timestampStyle = timestampStyle;
  }

  public List<ColumnDescription> getArrColDesc() {
    return arrColDesc;
  }

  public void setArrColDesc(List<ColumnDescription> arrColDesc) {
    this.arrColDesc = arrColDesc;
  }

  public ColumnType hasUniformSubType() {
    ColumnType prev = ColumnType.UNKNOWN;

    for (ColumnDescription colDesc : arrColDesc) {
      switch (colDesc.getType()) {
        case STRING:
        case LONG:
        case DOUBLE:
        case BOOLEAN:
        case TIMESTAMP:
          if (prev == ColumnType.UNKNOWN) {
            prev = colDesc.getType();
          } else {
            if (prev != colDesc.getType()) {
              return ColumnType.UNKNOWN;
            }
          }
          break;
        case ARRAY:
        case MAP:
          return ColumnType.UNKNOWN;
        case UNKNOWN:
          assert false : colDesc;
      }
    }
    return prev;
  }

  public Map<String, ColumnDescription> getMapColDesc() {
    return mapColDesc;
  }

  public void setMapColDesc(Map<String, ColumnDescription> mapColDesc) {
    this.mapColDesc = mapColDesc;
  }
}
