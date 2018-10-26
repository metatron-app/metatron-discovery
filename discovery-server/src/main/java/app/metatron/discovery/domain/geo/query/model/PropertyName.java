package app.metatron.discovery.domain.geo.query.model;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlText;

public class PropertyName {

  @JacksonXmlText
  String name;

  public PropertyName(String name) {
    this.name = name;
  }

  public String getName() {
    return name;
  }
}
