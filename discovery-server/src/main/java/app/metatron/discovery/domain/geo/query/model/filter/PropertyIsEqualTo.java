package app.metatron.discovery.domain.geo.query.model.filter;

public class PropertyIsEqualTo extends FilterProperties {
  public PropertyIsEqualTo() {
  }

  public PropertyIsEqualTo(String propertyName, String literal) {
    super(propertyName, literal);
  }
}
