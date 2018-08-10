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

package app.metatron.discovery.domain.admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Created by kyungtaak on 2017. 2. 2..
 */
@RestController
@RequestMapping("/api/admin")
public class SearchIndexController {

  @Autowired
  SearchIndexService searchIndexService;

  @RequestMapping(value = "/reindex", method = RequestMethod.POST, produces = "application/json")
  public ResponseEntity<?> fullReIndex(
      @RequestParam(value = "batchSize", required = false, defaultValue = "25") Integer batchSize) {

    searchIndexService.reindexAll(batchSize);

    return ResponseEntity.noContent().build();
  }
}
