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

package app.metatron.discovery.domain.datasource.data.forward;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import org.apache.commons.lang3.StringUtils;

import java.io.File;
import java.net.URI;
import java.util.UUID;

import app.metatron.discovery.domain.engine.EngineQueryProperties;

/**
 * Created by kyungtaak on 2016. 8. 24..
 */
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.EXTERNAL_PROPERTY, property = "type")
@JsonSubTypes({
        @JsonSubTypes.Type(value = CsvResultForward.class, name = "csv"),
        @JsonSubTypes.Type(value = JsonResultForward.class, name = "json"),
        @JsonSubTypes.Type(value = ParquetResultForward.class, name = "parquet"),
        @JsonSubTypes.Type(value = ExcelResultForward.class, name = "excel"),
        @JsonSubTypes.Type(value = OrcResultForward.class, name = "orc")
})
public abstract class ResultForward {

  String forwardUrl;

  Boolean removeFile = true;

  public ResultForward() {
  }

  public ResultForward(Boolean removeFile) {
    this.removeFile = removeFile;
  }

  public ResultForward(String forwardUrl) {
    this.forwardUrl = forwardUrl;
  }

  public String getForwardUrl() {
    if(StringUtils.isEmpty(forwardUrl)) {
      forwardUrl = EngineQueryProperties.getDefaultForwardUrl() +
              File.separator + "MFD-" + UUID.randomUUID().toString();
    }

    // need URI scheme for forwardContext
    URI url = URI.create(forwardUrl);
    if(url.getScheme() == null) {
      forwardUrl = "file://" + forwardUrl;
    }

    return forwardUrl;
  }

  public void setRemoveFile(Boolean removeFile) {
    this.removeFile = removeFile;
  }

  public Boolean getRemoveFile() {
    return removeFile;
  }

  @JsonIgnore
  public abstract ForwardType getForwardType();

  public enum ForwardType {
    NONE, JSON, CSV, PARQUET, ORC, EXCEL
  }
}
