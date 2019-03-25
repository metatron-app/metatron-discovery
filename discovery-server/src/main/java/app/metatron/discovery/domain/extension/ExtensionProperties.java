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

package app.metatron.discovery.domain.extension;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

@Component
@ConfigurationProperties(prefix = "polaris.extensions")
public class ExtensionProperties {

  public enum ExtensionType{
    LNB, CONNECTION
  }

  List<String> pluginEnable;
  List<String> pluginDisable;

  List<Lnb> lnb;

  public ExtensionProperties() {
  }

  public List<Lnb> getLnb() {
    return lnb;
  }

  public void setLnb(List<Lnb> lnb) {
    this.lnb = lnb;
  }

  public List<String> getPluginEnable() {
    return pluginEnable;
  }

  public void setPluginEnable(List<String> pluginEnable) {
    this.pluginEnable = pluginEnable;
  }

  public List<String> getPluginDisable() {
    return pluginDisable;
  }

  public void setPluginDisable(List<String> pluginDisable) {
    this.pluginDisable = pluginDisable;
  }

  public static class Lnb implements Serializable {
    String name;
    String parent;
    Integer level;
    Map<String, String> subContents;

    public Lnb() {
    }

    public String getName() {
      return name;
    }

    public void setName(String name) {
      this.name = name;
    }

    public String getParent() {
      return parent;
    }

    public void setParent(String parent) {
      this.parent = parent;
    }

    public Integer getLevel() {
      return level;
    }

    public void setLevel(Integer level) {
      this.level = level;
    }

    public Map<String, String> getSubContents() {
      return subContents;
    }

    public void setSubContents(Map<String, String> subContents) {
      this.subContents = subContents;
    }
  }
}
