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

package app.metatron.discovery.spec.druid.ingestion.parser;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;

import java.util.List;

import app.metatron.discovery.KeepAsUnescapeSerializer;

/**
 * Created by kyungtaak on 2017. 3. 30..
 */
public class TsvParseSpec extends CsvParseSpec implements ParseSpec {

  @JsonSerialize(using = KeepAsUnescapeSerializer.class)
  String delimiter;

  public TsvParseSpec() {
  }

  public TsvParseSpec(DimensionsSpec dimensionsSpec, TimestampSpec timestampSpec, List<String> columns, String delimiter) {
    super(dimensionsSpec, timestampSpec, columns);
    this.delimiter = delimiter;
  }

  public String getDelimiter() {
    return delimiter;
  }

  public void setDelimiter(String delimiter) {
    this.delimiter = delimiter;
  }

  @Override
  public String toString() {
    return ToStringBuilder.reflectionToString(this, ToStringStyle.JSON_STYLE);
  }
}
