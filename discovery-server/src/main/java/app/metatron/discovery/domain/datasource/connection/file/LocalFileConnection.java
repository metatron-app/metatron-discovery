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

package app.metatron.discovery.domain.datasource.connection.file;

import com.fasterxml.jackson.annotation.JsonTypeName;

import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

/**
 * Created by mini on 2016. 8. 12..
 */
@Entity
@DiscriminatorValue("FILE")
@JsonTypeName("FILE")
public class LocalFileConnection extends FileDataConnection {

  private static final String HDFS_URL_PREFIX = "file://";

  String path;

  Boolean removeFirstRow;

  /**
   * excel file인 경우 sheet 정보 필요.
   */
  Integer sheetIndex;

  public LocalFileConnection() {
  }

  public String getImplementor() {
    return "FILE";
  }

  @Override
  public String getConnectUrl() {
    return "local";
  }

  @Override
  public String makeConnectUrl(boolean includeDatabase) {
    return null;
  }

  public String getPath() {
    return path;
  }

  public void setPath(String path) {
    this.path = path;
  }

  public Boolean getRemoveFirstRow() {
    return removeFirstRow;
  }

  public void setRemoveFirstRow(Boolean removeFirstRow) {
    this.removeFirstRow = removeFirstRow;
  }

  public Integer getSheetIndex() {
    return sheetIndex;
  }

  public void setSheetIndex(Integer sheetIndex) {
    this.sheetIndex = sheetIndex;
  }

  @Override
  public String toString() {
    return "LocalFileConnection{}" + super.toString();
  }
}
