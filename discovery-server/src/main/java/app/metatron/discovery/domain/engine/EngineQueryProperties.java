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

package app.metatron.discovery.domain.engine;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Created by kyungtaak on 2016. 8. 28..
 */
@Component
public final class EngineQueryProperties {

  private static Map<String, EngineProperties.Host> hosts;
  private static String localResultDir;
  private static String defaultForwardUrl;
  private static String defaultTimezone;
  private static String defaultLocale;

  @Autowired
  public EngineQueryProperties(EngineProperties engineProperties) {
    EngineProperties.QueryInfo queryInfo = engineProperties.getQuery();

    hosts = queryInfo.getHosts();
    localResultDir = queryInfo.getLocalResultDir();
    defaultForwardUrl = queryInfo.getDefaultForwardUrl();
    defaultTimezone = StringUtils.isEmpty(queryInfo.getDefaultTimezone()) ? "UTC" : queryInfo.getDefaultTimezone();
    defaultLocale = StringUtils.isEmpty(queryInfo.getDefaultLocale()) ? "en" : queryInfo.getDefaultLocale();
  }

  public static Map<String,EngineProperties.Host> getHosts() {
    return hosts;
  }

  public static String getLocalResultDir() {
    return localResultDir;
  }

  public static String getDefaultForwardUrl() {
    return defaultForwardUrl;
  }

  public static String getDefaultTimezone() {
    return defaultTimezone;
  }

  public static String getDefaultLocale() {
    return defaultLocale;
  }
}
