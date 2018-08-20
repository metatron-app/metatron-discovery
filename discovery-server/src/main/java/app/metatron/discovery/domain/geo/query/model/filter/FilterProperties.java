package app.metatron.discovery.domain.geo.query.model.filter;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;

public abstract class FilterProperties {

  @JacksonXmlProperty(localName = "PropertyName")
  String propertyName;

  @JacksonXmlProperty(localName = "Literal")
  String literal;

  public FilterProperties() {
  }

  public FilterProperties(String propertyName, String literal) {
    this.propertyName = propertyName;
    this.literal = literal;
  }

  public String getPropertyName() {
    return propertyName;
  }

  public String getLiteral() {
    return literal;
  }
}
