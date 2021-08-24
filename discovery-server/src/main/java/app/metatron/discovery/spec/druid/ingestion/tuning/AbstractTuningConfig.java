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
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.spec.druid.ingestion.tuning;

import com.google.common.collect.Maps;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.apache.commons.collections4.MapUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.PropertyAccessorFactory;

import java.util.Map;

import app.metatron.discovery.domain.datasource.DataSourceErrorCodes;
import app.metatron.discovery.domain.datasource.DataSourceException;
import app.metatron.discovery.spec.druid.ingestion.index.IndexSpec;

public abstract class AbstractTuningConfig implements TuningConfig {

  private static Logger LOGGER = LoggerFactory.getLogger(AbstractTuningConfig.class);

  Integer maxRowsInMemory;

  Boolean ignoreInvalidRows;

  Boolean buildV9Directly;

  IndexSpec indexSpec;

  Map<String, String> jobProperties;


  public void overrideConfig(Map<String, Object> tuningConfig) {

    ObjectMapper mapper = new ObjectMapper();

    mapper.configure(MapperFeature.USE_BASE_TYPE_AS_DEFAULT_IMPL, true);
    mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    String configJson;
    try {
      configJson = mapper.writeValueAsString(tuningConfig);
      copyProperties(mapper.readValue(configJson, this.getClass()), this, tuningConfig.keySet());
    } catch (Exception e) {
      throw new DataSourceException(DataSourceErrorCodes.INGESTION_COMMON_ERROR, e.getMessage());
    }

  }

  public void addJobProperty(String key, String value) {
    if (jobProperties == null) {
      jobProperties = Maps.newHashMap();
    }

    this.jobProperties.put(key, value);
  }

  public void addJobProperty(Map<String, Object> jobProperties) {

    if (MapUtils.isNotEmpty(jobProperties)) {
      for (String key : jobProperties.keySet()) {
        addJobProperty(key, String.valueOf(jobProperties.get(key)));
      }
    }
  }

  private static void copyProperties(Object source, Object target, Iterable<String> props) {

    BeanWrapper sourceWrap = PropertyAccessorFactory.forBeanPropertyAccess(source);
    BeanWrapper targetWrap = PropertyAccessorFactory.forBeanPropertyAccess(target);

    props.forEach(p -> {
      try {
        targetWrap.setPropertyValue(p, sourceWrap.getPropertyValue(p));
      } catch (Exception e) {
        LOGGER.warn("Unknown property : {}", p);
      }
    });

  }

  public Integer getMaxRowsInMemory() {
    return maxRowsInMemory;
  }

  public void setMaxRowsInMemory(Integer maxRowsInMemory) {
    this.maxRowsInMemory = maxRowsInMemory;
  }

  public Boolean getIgnoreInvalidRows() {
    return ignoreInvalidRows;
  }

  public void setIgnoreInvalidRows(Boolean ignoreInvalidRows) {
    this.ignoreInvalidRows = ignoreInvalidRows;
  }

  public Boolean getBuildV9Directly() {
    return buildV9Directly;
  }

  public void setBuildV9Directly(Boolean buildV9Directly) {
    this.buildV9Directly = buildV9Directly;
  }

  @Override
  public IndexSpec getIndexSpec() {
    return indexSpec;
  }

  @Override
  public void setIndexSpec(IndexSpec indexSpec) {
    this.indexSpec = indexSpec;
  }

  public Map<String, String> getJobProperties() {
    return jobProperties;
  }

  public void setJobProperties(Map<String, String> jobProperties) {
    this.jobProperties = jobProperties;
  }
}
