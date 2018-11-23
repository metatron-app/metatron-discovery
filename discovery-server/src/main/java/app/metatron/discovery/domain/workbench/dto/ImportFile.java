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

package app.metatron.discovery.domain.workbench.dto;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "type")
@JsonSubTypes({
    @JsonSubTypes.Type(value = ImportExcelFile.class, name = "excel"),
    @JsonSubTypes.Type(value = ImportCsvFile.class, name = "csv"),
})
public abstract class ImportFile {
  private Boolean firstRowHeadColumnUsed = false;
  private String tableName;
  private String uploadedFile;
  private String loginUserId;
  private String webSocketId;

  public String getUploadedFile() {
    return uploadedFile;
  }

  public void setUploadedFile(String uploadedFile) {
    this.uploadedFile = uploadedFile;
  }

  public String getLoginUserId() {
    return loginUserId;
  }

  public void setLoginUserId(String loginUserId) {
    this.loginUserId = loginUserId;
  }

  public String getWebSocketId() {
    return webSocketId;
  }

  public void setWebSocketId(String webSocketId) {
    this.webSocketId = webSocketId;
  }

  public String getTableName() {
    return tableName;
  }

  public void setTableName(String tableName) {
    this.tableName = tableName;
  }

  public Boolean getFirstRowHeadColumnUsed() {
    return firstRowHeadColumnUsed;
  }

  public void setFirstRowHeadColumnUsed(Boolean firstRowHeadColumnUsed) {
    this.firstRowHeadColumnUsed = firstRowHeadColumnUsed;
  }
}