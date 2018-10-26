package app.metatron.discovery.domain.geo.query.model.filter;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;

public class PropertyIsBetween extends FilterProperties {

  @JacksonXmlProperty(localName = "LowerBoundary")
  Boundary lowerBoundary;

  @JacksonXmlProperty(localName = "UpperBoundary")
  Boundary upperBoundary;

  public PropertyIsBetween(String propertyName, String lowerBoundary, String upperBoundary) {
    super(propertyName, null);
    this.lowerBoundary = new Boundary(lowerBoundary);
    this.upperBoundary = new Boundary(upperBoundary);
  }

  public Boundary getLowerBoundary() {
    return lowerBoundary;
  }

  public Boundary getUpperBoundary() {
    return upperBoundary;
  }

  public static class Boundary {
    String literal;

    public Boundary(String literal) {
      this.literal = literal;
    }

    public String getLiteral() {
      return literal;
    }
  }
}
