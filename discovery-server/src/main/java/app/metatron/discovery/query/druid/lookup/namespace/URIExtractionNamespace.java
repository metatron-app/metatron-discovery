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

package app.metatron.discovery.query.druid.lookup.namespace;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonTypeName;

import java.util.List;

/**
 *
 */
@JsonTypeName("uri")
public class URIExtractionNamespace implements ExtractionNamespace {
  private String uri;
  private String uriPrefix;
  private FlatDataParser namespaceParseSpec;
  private String fileRegex;
  private String pollPeriod;

  public URIExtractionNamespace() {
  }

  public URIExtractionNamespace(String uri, String uriPrefix, FlatDataParser namespaceParseSpec, String fileRegex, String pollPeriod) {
    this.uri = uri;
    this.uriPrefix = uriPrefix;
    this.namespaceParseSpec = namespaceParseSpec;
    this.fileRegex = fileRegex;
    this.pollPeriod = pollPeriod;
  }

  public String getUri() {
    return uri;
  }

  public void setUri(String uri) {
    this.uri = uri;
  }

  public String getUriPrefix() {
    return uriPrefix;
  }

  public void setUriPrefix(String uriPrefix) {
    this.uriPrefix = uriPrefix;
  }

  public FlatDataParser getNamespaceParseSpec() {
    return namespaceParseSpec;
  }

  public void setNamespaceParseSpec(FlatDataParser namespaceParseSpec) {
    this.namespaceParseSpec = namespaceParseSpec;
  }

  public String getFileRegex() {
    return fileRegex;
  }

  public void setFileRegex(String fileRegex) {
    this.fileRegex = fileRegex;
  }

  public String getPollPeriod() {
    return pollPeriod;
  }

  public void setPollPeriod(String pollPeriod) {
    this.pollPeriod = pollPeriod;
  }

  @JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "format")
  @JsonSubTypes(value = {
      @JsonSubTypes.Type(name = "csv", value = CSVFlatDataParser.class),
      @JsonSubTypes.Type(name = "tsv", value = TSVFlatDataParser.class)
  })

  public interface FlatDataParser {
  }

  @JsonTypeName("csv")
  public static class CSVFlatDataParser implements FlatDataParser {
    private List<String> columns;
    private List<String> keyColumns;
    private String valueColumn;

    public CSVFlatDataParser() {
    }

    public CSVFlatDataParser(List<String> columns, List<String> keyColumns, String valueColumn) {
      this.columns = columns;
      this.keyColumns = keyColumns;
      this.valueColumn = valueColumn;
    }

    public List<String> getColumns() {
      return columns;
    }

    public List<String> getKeyColumns() {
      return this.keyColumns;
    }

    public String getValueColumn() {
      return this.valueColumn;
    }

  }

  @JsonTypeName("tsv")
  public static class TSVFlatDataParser implements FlatDataParser {
    private List<String> columns;
    private String delimiter;
    private List<String> keyColumns;
    private String listDelimiter;
    private String valueColumn;

    public TSVFlatDataParser() {
    }

    public TSVFlatDataParser(List<String> columns, String delimiter, List<String> keyColumns, String listDelimiter, String valueColumn) {
      this.columns = columns;
      this.delimiter = delimiter;
      this.keyColumns = keyColumns;
      this.listDelimiter = listDelimiter;
      this.valueColumn = valueColumn;
    }

    public List<String> getColumns() {
      return columns;
    }

    public List<String> getKeyColumns() {
      return this.keyColumns;
    }

    public String getValueColumn() {
      return this.valueColumn;
    }

    public String getListDelimiter() {
      return listDelimiter;
    }

    public String getDelimiter() {
      return delimiter;
    }

  }
}
