/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specic language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.extension;

import org.apache.commons.collections4.CollectionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.InitBinder;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import app.metatron.discovery.extension.dataconnection.jdbc.dialect.JdbcDialect;
import app.metatron.discovery.util.CaseInsensitiveConverter;

@RestController
@RequestMapping("/api")
public class ExtensionController {

  private static Logger LOGGER = LoggerFactory.getLogger(ExtensionController.class);

  @Autowired
  ExtensionProperties extensionProperties;

  @Autowired
  List<JdbcDialect> jdbcDialects;

  @RequestMapping(value = "/extensions/{extensionType}", method = RequestMethod.GET)
  public ResponseEntity<?> findExtensionInfoByType(@PathVariable ExtensionProperties.ExtensionType extensionType) {

    switch (extensionType){
      case LNB:
        List<ExtensionProperties.Lnb> lnbs = extensionProperties.getLnb();
        if (CollectionUtils.isEmpty(lnbs)) {
          return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(lnbs);
      case CONNECTION:
        if(jdbcDialects == null || jdbcDialects.size() == 0){
          return ResponseEntity.noContent().build();
        }

        List<Map<String, Object>> connectionList
            = jdbcDialects.stream()
                          .filter(jdbcDialect -> !jdbcDialect.getImplementor().equals("STAGE"))
                          .map(jdbcDialect -> {
                            Map<String, Object> dialectInfo = new HashMap<>();
                            dialectInfo.put("implementor", jdbcDialect.getImplementor());
                            dialectInfo.put("scope", jdbcDialect.getScope());
                            dialectInfo.put("name", jdbcDialect.getName());
                            dialectInfo.put("inputSpec", jdbcDialect.getInputSpec());
                            dialectInfo.put("iconResource1", jdbcDialect.getIconResource1());
                            dialectInfo.put("iconResource2", jdbcDialect.getIconResource2());
                            dialectInfo.put("iconResource3", jdbcDialect.getIconResource3());
                            dialectInfo.put("iconResource4", jdbcDialect.getIconResource4());
                            return dialectInfo;
                          })
                          .collect(Collectors.toList());
        return ResponseEntity.ok(connectionList);
      default:
        throw new IllegalArgumentException("Not supported type " + extensionType);
    }
  }

  @InitBinder
  public void initBinder(final WebDataBinder webdataBinder) {
    webdataBinder.registerCustomEditor(ExtensionProperties.ExtensionType.class,
            new CaseInsensitiveConverter(ExtensionProperties.ExtensionType.class));
  }
}
