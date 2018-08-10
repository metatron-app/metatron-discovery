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

package app.metatron.discovery.domain.datasource.data;

import com.google.common.collect.Maps;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import app.metatron.discovery.domain.datasource.DataSourceAlias;
import app.metatron.discovery.domain.datasource.DataSourceAliasRepository;
import app.metatron.discovery.domain.datasource.data.alias.Alias;
import app.metatron.discovery.domain.datasource.data.alias.CodeTableAlias;
import app.metatron.discovery.domain.datasource.data.alias.MapAlias;
import app.metatron.discovery.domain.datasource.data.alias.ValueRefAlias;
import app.metatron.discovery.domain.mdm.CodeTableService;

@Component
public class AliasFactory {

  @Autowired
  private DataSourceAliasRepository aliasRepository;

  @Autowired
  private CodeTableService codeTableService;

  public AliasFactory() {
  }

  public Map<String, Map<String, String>> getAliasMap(List<Alias> aliases) {

    Map<String, Map<String, String>> resultMap = Maps.newHashMap();
    for (Alias alias : aliases) {
      Map<String, Map<String, String>> aliasMap = getAliasMap(alias);
      resultMap.putAll(aliasMap);
    }

    return resultMap;
  }

  public Map<String, Map<String, String>> getAliasMap(Alias alias) {

    if (alias instanceof ValueRefAlias) {
      return aliasRepository.findByDashBoardId(((ValueRefAlias) alias).getRef())
                            .stream()
                            .filter(dataSourceAlias -> StringUtils.isNotEmpty(dataSourceAlias.getValueAlias()))
                            .collect(Collectors.toMap(DataSourceAlias::getFieldName, valueAlias -> valueAlias.getValueAliasMap()));

    } else if (alias instanceof CodeTableAlias) {
      final Map<String, Map<String, String>> aliasMap = Maps.newHashMap();

      Map<String, String> codeTablePair = ((CodeTableAlias) alias).getCodes();
      for (String key : codeTablePair.keySet()) {
        codeTableService.getCodeValuePair(codeTablePair.get(key)).ifPresent(map ->
                                                                                aliasMap.put(key, map)
        );
      }
      return aliasMap;

    } else if (alias instanceof MapAlias) {
      return ((MapAlias) alias).getValues();
    }

    return Maps.newHashMap();
  }
}
