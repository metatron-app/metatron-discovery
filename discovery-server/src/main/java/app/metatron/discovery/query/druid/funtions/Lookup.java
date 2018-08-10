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

package app.metatron.discovery.query.druid.funtions;

import com.google.common.base.Preconditions;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Created by kyungtaak on 2017. 4. 27..
 */
public class Lookup {

  private static final String REPLACEMISSINGVALUEWITH_PARAM = "replaceMissingValueWith";

  String namespaceName;
  String replaceMissingValueWith;
  List<String> keys;

  public Lookup(String namespaceName, List<String> keys) {
    Preconditions.checkArgument(CollectionUtils.isNotEmpty(keys), "Key required for Lookup function");

    this.namespaceName = namespaceName;
    this.keys = keys;
  }

  public Lookup(String namespaceName, String replaceMissingValueWith, List<String> keys) {
    Preconditions.checkArgument(CollectionUtils.isNotEmpty(keys), "Key required for Lookup function");

    this.namespaceName = namespaceName;
    this.replaceMissingValueWith = replaceMissingValueWith;
    this.keys = keys;
  }

  public void setReplaceMissingValueWith(String replaceMissingValueWith) {
    this.replaceMissingValueWith = replaceMissingValueWith;
  }

  public String value() {
    StringBuilder builder = new StringBuilder();
    builder.append("lookup('")
        .append(namespaceName).append("',");

    builder.append(StringUtils.join(
        keys.stream()
            .map(s -> "\"" + s + "\"").collect(Collectors.toList()), ","));

    if(StringUtils.isNotEmpty(replaceMissingValueWith)) {
      builder.append(",").append(REPLACEMISSINGVALUEWITH_PARAM)
          .append("=")
          .append("'")
          .append(replaceMissingValueWith)
          .append("'");
    }

    builder.append(")");

    return builder.toString();
  }
}
