package app.metatron.discovery.domain.geo.query.model.filter;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;

public class Envelope {
  @JacksonXmlProperty(isAttribute = true, localName = "service")
  String srsDimension = "2";

  @JacksonXmlProperty(isAttribute = true, localName = "version")
  String srsName = "EPSG:4326";

  String lowerCorner;

  String upperCorner;

  public Envelope(String srsDimension, String srsName, String lowerCorner, String upperCorner) {
    this.srsDimension = srsDimension;
    this.srsName = srsName;
    this.lowerCorner = lowerCorner;
    this.upperCorner = upperCorner;
  }

  public Envelope(String lowerCorner, String upperCorner) {
    this.lowerCorner = lowerCorner;
    this.upperCorner = upperCorner;
  }

  public String getSrsDimension() {
    return srsDimension;
  }

  public void setSrsDimension(String srsDimension) {
    this.srsDimension = srsDimension;
  }

  public String getSrsName() {
    return srsName;
  }

  public void setSrsName(String srsName) {
    this.srsName = srsName;
  }

  public String getLowerCorner() {
    return lowerCorner;
  }

  public void setLowerCorner(String lowerCorner) {
    this.lowerCorner = lowerCorner;
  }

  public String getUpperCorner() {
    return upperCorner;
  }

  public void setUpperCorner(String upperCorner) {
    this.upperCorner = upperCorner;
  }

}
