package app.metatron.discovery.domain.geo.query.model.filter;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;

public class PropertyIsLike extends FilterProperties {

  @JacksonXmlProperty(isAttribute = true, localName = "wildCard")
  String wildCard = "*";

  @JacksonXmlProperty(isAttribute = true, localName = "singleChar")
  String singleChar = ".";

  @JacksonXmlProperty(isAttribute = true, localName = "escapeChar")
  String escapeChar = "!";

  public PropertyIsLike(String propertyName, String literal) {
    super(propertyName, literal);
  }

  public PropertyIsLike(String propertyName, String literal, String wildCard, String singleChar, String escapeChar) {
    super(propertyName, literal);
    this.wildCard = wildCard;
    this.singleChar = singleChar;
    this.escapeChar = escapeChar;
  }

  public String getWildCard() {
    return wildCard;
  }

  public String getSingleChar() {
    return singleChar;
  }

  public String getEscapeChar() {
    return escapeChar;
  }
}
