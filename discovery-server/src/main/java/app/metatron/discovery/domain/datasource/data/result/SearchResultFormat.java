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

package app.metatron.discovery.domain.datasource.data.result;

import com.google.common.collect.Lists;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.JsonNode;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.Serializable;
import java.net.URI;
import java.util.List;
import java.util.Map;

import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.domain.datasource.QueryHistoryTeller;
import app.metatron.discovery.domain.datasource.data.QueryTimeExcetpion;
import app.metatron.discovery.domain.datasource.data.SearchQueryRequest;
import app.metatron.discovery.domain.engine.EngineProperties;
import app.metatron.discovery.domain.engine.EngineQueryProperties;
import app.metatron.discovery.util.SshUtils;

/**
 *
 */
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.EXTERNAL_PROPERTY, property = "type")
@JsonSubTypes({
        @JsonSubTypes.Type(value = ObjectResultFormat.class, name = "object"),
        @JsonSubTypes.Type(value = ChartResultFormat.class, name = "chart"),
        @JsonSubTypes.Type(value = GraphResultFormat.class, name = "graph"),
        @JsonSubTypes.Type(value = FileResultFormat.class, name = "file"),
        @JsonSubTypes.Type(value = RawResultFormat.class, name = "raw"),
        @JsonSubTypes.Type(value = PivotResultFormat.class, name = "dpivot")
})
public abstract class SearchResultFormat implements Serializable {

  private static Logger LOGGER = LoggerFactory.getLogger(SearchResultFormat.class);

  @JsonIgnore
  protected SearchQueryRequest request;

  @JsonIgnore
  protected DataSource.ConnectionType connType;

  public SearchResultFormat() {
  }

  public SearchResultFormat(DataSource.ConnectionType connType) {
    this.connType = connType;
  }

  public SearchResultFormat(SearchQueryRequest request) {
    this.request = request;
  }

  public abstract Object makeResult(JsonNode node);

  public void setRequest(SearchQueryRequest request) {
    this.request = request;
  }

  public SearchQueryRequest getRequest() {
    return request;
  }

  public DataSource.ConnectionType getConnType() {
    return connType;
  }

  public void setConnType(DataSource.ConnectionType connType) {
    this.connType = connType;
  }

  protected boolean checkFileResult(JsonNode node) {
    if (node.get(0) == null) return false;
    JsonNode checkNode = node.get(0);
    return checkNode.has("numRows") || checkNode.has("rowCount") ? true : false;
  }

  protected URI getResultFileURI(JsonNode node) {
    return getResultFileURI(node, null);
  }

  protected URI getResultFileURI(JsonNode node, String targetDir) {

    JsonNode firstNode = node.get(0);
    JsonNode pathNode = firstNode.get("data");

    String path = pathNode.fieldNames().next();
    long size = pathNode.get(path).asLong();

    long rows = 0L;
    if(firstNode.has("numRows")) {
      rows = firstNode.get("numRows").asLong();
    } else if(firstNode.has("rowCount")) {
      rows = firstNode.get("rowCount").asLong();
    }

    /* for history */ QueryHistoryTeller.setResultCountAndSize(rows, size);
    LOGGER.info("Forward file : {} (rows: {}, size: {})", path, rows, size);

    URI location;
    try {
      location = URI.create(path);
    } catch (Exception e) {
      LOGGER.error("Invalid forward path({}) : {}", path, ExceptionUtils.getMessage(e));
      throw new QueryTimeExcetpion("Invalid forward path : " + path);
    }

    String scheme = location.getScheme();
    if ("hdfs".equals(scheme)) {
      // TODO: 어떻게 할지 고민이 필요함
      return location;
    } else if ("file".equals(scheme) && StringUtils.isEmpty(location.getHost())) {
      return location;
    } else {

      String localPath;
      Map<String, EngineProperties.Host> hosts = EngineQueryProperties.getHosts();
      if(!"localhost".equals(location.getHost())
          && hosts.containsKey(location.getHost())) {
        EngineProperties.Host host = hosts.get(location.getHost());
        try {
          if(StringUtils.isEmpty(targetDir)) {
            targetDir = EngineQueryProperties.getLocalResultDir();
          }
          List<String> downloadedPath =
              SshUtils.copyRemoteToLocalFileBySftp(Lists.newArrayList(location.getPath()),
                  targetDir,
                  location.getHost(),
                  host.getPort(),
                  host.getUsername(),
                  host.getPassword(),
                  false,
                  true);
          localPath = downloadedPath.get(0);
        } catch (Exception e) {
          throw new QueryTimeExcetpion("Fail to transfer result file from remote host.");
        }
      } else {
        localPath = location.getPath();
      }

      return URI.create("file://" + localPath);
    }
  }

  public enum ResultType {
    MAP, MATRIX
  }

}
