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

package app.metatron.discovery.common.entity;

import com.google.common.collect.Lists;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang3.StringUtils;

import java.util.List;
import java.util.StringJoiner;

import javax.persistence.AttributeConverter;

/**
 * Created by kyungtaak on 2016. 5. 10..
 */
public class StringListConverter implements AttributeConverter<List<String>, String> {

  private static final String SEP = ",";

  @Override
  public String convertToDatabaseColumn(List<String> objects) {

    if(CollectionUtils.isEmpty(objects)) {
      return null;
    }

    StringJoiner joiner = new StringJoiner(SEP);
    for(String str : objects) {
      joiner.add(str);
    }

    return joiner.toString();
  }

  @Override
  public List<String> convertToEntityAttribute(String s) {

    if(StringUtils.isEmpty(s)) {
      return null;
    }

    return Lists.newArrayList(StringUtils.split(SEP));
  }
}
