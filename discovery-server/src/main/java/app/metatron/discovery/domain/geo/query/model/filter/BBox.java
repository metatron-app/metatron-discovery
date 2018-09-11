package app.metatron.discovery.domain.geo.query.model.filter;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;

public class BBox extends FilterProperties {

  @JacksonXmlProperty(localName = "Envelope")
  Envelope envelope;

  public BBox(String propertyName, Envelope envelope) {
    super(propertyName, null);
    this.envelope = envelope;
  }

  public BBox(String propertyName, String lowerCorner, String upperCorner) {
    super(propertyName, null);
    this.envelope = new Envelope(lowerCorner, upperCorner);
  }

  public Envelope getEnvelope() {
    return envelope;
  }

  public void setEnvelope(Envelope envelope) {
    this.envelope = envelope;
  }
}


