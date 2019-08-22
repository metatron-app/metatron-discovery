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

package app.metatron.discovery.domain.mdm.lineage;

import java.io.Serializable;

public class LineageNode implements Serializable {

  public static final String FR_META_ID = "frMetaId";
  public static final String FR_META_NAME = "frMetaName";
  public static final String FR_COL_NAME = "frColName";

  public static final String TO_META_ID = "toMetaId";
  public static final String TO_META_NAME = "toMetaName";
  public static final String TO_COL_NAME = "toColName";

  private String metaId;
  private String metaName;
  private String colName;

  public LineageNode() {
  }

  public LineageNode(String metaId, String metaName) {
    this.metaId = metaId;
    this.metaName = metaName;
  }

  public LineageNode(String metaId, String metaName, String colName) {
    this(metaId, metaName);
    // TODO: column dependency is not implemented yet.
  }

  public String getMetaId() {
    return metaId;
  }

  public void setMetaId(String metaId) {
    this.metaId = metaId;
  }

  public String getMetaName() {
    return metaName;
  }

  public void setMetaName(String metaName) {
    this.metaName = metaName;
  }

  public String getColName() {
    return colName;
  }

  public void setColName(String colName) {
    this.colName = colName;
  }

  @Override
  public String toString() {
    return "LineageMapNode{" +
        "metaId='" + metaId + '\'' +
        ", metaName='" + metaName + '\'' +
        ", colName='" + colName + '\'' +
        '}';
  }
}
