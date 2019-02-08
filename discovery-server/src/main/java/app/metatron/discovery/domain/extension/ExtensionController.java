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

import app.metatron.discovery.util.CaseInsensitiveConverter;
import org.apache.commons.collections4.CollectionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ExtensionController {

  private static Logger LOGGER = LoggerFactory.getLogger(ExtensionController.class);

  @Autowired
  ExtensionProperties extensionProperties;

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
        break;
      default:
        throw new IllegalArgumentException("Not supported type " + extensionType);
    }

    return ResponseEntity.badRequest().build();
  }

  @InitBinder
  public void initBinder(final WebDataBinder webdataBinder) {
    webdataBinder.registerCustomEditor(ExtensionProperties.ExtensionType.class,
            new CaseInsensitiveConverter(ExtensionProperties.ExtensionType.class));
  }
}
