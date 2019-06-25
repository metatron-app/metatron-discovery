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

package app.metatron.discovery.domain.storage;

import app.metatron.discovery.util.CaseInsensitiveConverter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class StorageController {

  private static Logger LOGGER = LoggerFactory.getLogger(StorageController.class);

  @Autowired(required = false)
  StorageProperties storageProperties;

  @RequestMapping(value = "/storage/{storageType}", method = RequestMethod.GET)
  public ResponseEntity<?> findStorageInfoByType(@PathVariable StorageProperties.StorageType storageType) {

    switch (storageType){
      case STAGEDB:
        if(storageProperties == null || storageProperties.getStagedb() == null) {
          return ResponseEntity.noContent().build();
        }
        StorageProperties.StageDBConnection stageDBConnection = storageProperties.getStagedb();

        return ResponseEntity.ok(stageDBConnection);
      default:
        throw new IllegalArgumentException("Not supported type " + storageType);
    }
  }

  @InitBinder
  public void initBinder(final WebDataBinder webdataBinder) {
    webdataBinder.registerCustomEditor(StorageProperties.StorageType.class,
            new CaseInsensitiveConverter(StorageProperties.StorageType.class));
  }
}
