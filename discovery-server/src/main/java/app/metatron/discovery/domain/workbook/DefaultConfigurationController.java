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

package app.metatron.discovery.domain.workbook;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

import app.metatron.discovery.common.RawJsonString;

/**
 * Created by kyungtaak on 2017. 4. 19..
 */
@RestController
@RequestMapping("/api")
public class DefaultConfigurationController {

  @Autowired
  DefaultConfigurationRepository defaultConfigurationRepository;

  @Value("${polaris.chart.profile:default}")
  String profile;

  @RequestMapping(value = "/configurations/chart/default", method = RequestMethod.GET, produces = "application/json")
  public ResponseEntity<?> findDefaultConfigrationForChart(@RequestParam("type") String type) throws IOException {

    DefaultConfiguration defaultConfiguration = defaultConfigurationRepository
        .findByDomainAndTypeAndProfile(DefaultConfiguration.DomainType.CHART, type, profile);

    if(defaultConfiguration == null || StringUtils.isEmpty(defaultConfiguration.getSpec())) {
      return ResponseEntity.ok("");
    } else {
      return ResponseEntity.ok(new RawJsonString(defaultConfiguration.getSpec()));
    }
  }
}
