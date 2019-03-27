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

package app.metatron.discovery.extensions;

import org.pf4j.PluginStatusProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

import app.metatron.discovery.domain.extension.ExtensionProperties;

/**
 *
 */
public class CustomPluginStatusProvider implements PluginStatusProvider {

  private static final Logger log = LoggerFactory.getLogger(CustomPluginStatusProvider.class);

  private List<String> enabledPlugins;
  private List<String> disabledPlugins;

  public void initialize(ExtensionProperties extensionProperties) {
    // create a list with plugin identifiers that should be only accepted by this manager (whitelist from plugins/enabled.txt file)
    enabledPlugins = extensionProperties == null || extensionProperties.getPluginEnable() == null
            ? new ArrayList<>()
            : extensionProperties.getPluginEnable();
    log.info("Enabled plugins: {}", enabledPlugins);

    // create a list with plugin identifiers that should not be accepted by this manager (blacklist from plugins/disabled.txt file)
    disabledPlugins = extensionProperties == null || extensionProperties.getPluginDisable() == null
            ? new ArrayList<>()
            : extensionProperties.getPluginDisable();
    log.info("Disabled plugins: {}", disabledPlugins);
  }

  @Override
  public boolean isPluginDisabled(String pluginId) {
    if (disabledPlugins.contains(pluginId)) {
      return true;
    }

    return !enabledPlugins.isEmpty() && !enabledPlugins.contains(pluginId);
  }

  @Override
  public boolean disablePlugin(String pluginId) {
    disabledPlugins.add(pluginId);
    return true;
  }

  @Override
  public boolean enablePlugin(String pluginId) {
    disabledPlugins.remove(pluginId);
    return true;
  }
}
