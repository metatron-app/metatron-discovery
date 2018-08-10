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

package app.metatron.discovery.spec.druid.ingestion.tuning;

import org.apache.commons.beanutils.BeanUtils;
import org.apache.commons.collections4.MapUtils;

import java.util.Map;

/**
 * Created by kyungtaak on 2016. 6. 18..
 */
public class KafkaTuningConfig implements TuningConfig {

  Long maxRowsPerSegment;

  public KafkaTuningConfig() {
  }

  public void overrideConfig(Map<String, Object> tuningConfig) {

    if(MapUtils.isNotEmpty(tuningConfig)) {
      for (String key : tuningConfig.keySet()) {
        try {
          BeanUtils.setProperty(this, key, tuningConfig.get(key));
        } catch (Exception e) {
        }
      }
    }

  }

  public static KafkaTuningConfig defaultConfig() {
    KafkaTuningConfig config = new KafkaTuningConfig();
    config.setMaxRowsPerSegment(5000000L);

    return config;
  }

  public Long getMaxRowsPerSegment() {
    return maxRowsPerSegment;
  }

  public void setMaxRowsPerSegment(Long maxRowsPerSegment) {
    this.maxRowsPerSegment = maxRowsPerSegment;
  }
}
