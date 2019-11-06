package app.metatron.discovery.common;

import com.google.common.collect.Maps;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@ConfigurationProperties(prefix = "polaris.connection")
public class ConnectionConfigProperties {
  private Map<String, Map<String, String>> propertyGroup = Maps.newHashMap();

  public Map<String, Map<String, String>> getPropertyGroup() {
    return propertyGroup;
  }

  public void setPropertyGroup(Map<String, Map<String, String>> propertyGroup) {
    this.propertyGroup = propertyGroup;
  }

  public Map<String, String> findPropertyGroupByName(String name) {
    return propertyGroup.getOrDefault(name, Maps.newHashMap());
  }
}
