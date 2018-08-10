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

package app.metatron.discovery.query.druid.queries;

import com.fasterxml.jackson.annotation.JsonTypeName;

import java.util.List;
import java.util.StringJoiner;

import app.metatron.discovery.domain.workbook.configurations.datasource.DataSource;
import app.metatron.discovery.query.druid.Query;

/**
 * Created by kyungtaak on 2016. 10. 21..
 */
@JsonTypeName("partitioned")
public class PartitionRegexQuery extends Query {

  List<String> regExprs;

  public String toCommaExprs() {
    StringJoiner joiner = new StringJoiner(",");
    regExprs.forEach(
        expr -> joiner.add(expr)
    );

    return joiner.toString();
  }

  public List<String> getRegExprs() {
    return regExprs;
  }

  public void setRegExprs(List<String> regExprs) {
    this.regExprs = regExprs;
  }

  public static PartitionRegexQueryBuilder builder(DataSource dataSource) {
    return new PartitionRegexQueryBuilder(dataSource);
  }
}
