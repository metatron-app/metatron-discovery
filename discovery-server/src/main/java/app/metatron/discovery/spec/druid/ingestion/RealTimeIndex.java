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

package app.metatron.discovery.spec.druid.ingestion;

import com.google.common.collect.Maps;

import org.apache.commons.lang3.StringUtils;

import java.util.Map;

import javax.validation.constraints.NotNull;

/**
 * Created by kyungtaak on 2016. 6. 18..
 */
public class RealTimeIndex implements Index {

  @NotNull
  IngestionSpec spec;

  Map<String, Object> context;

  public RealTimeIndex() {
  }

  public RealTimeIndex(IngestionSpec spec) {
    this.spec = spec;
  }

  public RealTimeIndex(IngestionSpec spec, String dedicatedWorker) {
    this.spec = spec;

    if(StringUtils.isNotEmpty(dedicatedWorker)) {
      this.context = Maps.newHashMap();
      this.context.put("druid.task.runner.dedicated.host", dedicatedWorker);
    }
  }

  public void addConext(String key, String value) {
    if(context == null) {
      context = Maps.newHashMap();
    }

    context.put(key, value);
  }

  public IngestionSpec getSpec() {
    return spec;
  }

  public void setSpec(IngestionSpec spec) {
    this.spec = spec;
  }

  public Map<String, Object> getContext() {
    return context;
  }

  public void setContext(Map<String, Object> context) {
    this.context = context;
  }
}
