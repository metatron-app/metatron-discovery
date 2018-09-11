package app.metatron.discovery.domain.geo.query.model;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;

@JacksonXmlRootElement(localName = "GetFeature")
public class GetFeature {

  @JacksonXmlProperty(isAttribute = true, namespace = "http://www.opengis.net/wfs", localName = "service")
  String service = "WFS";

  @JacksonXmlProperty(isAttribute = true, localName = "version")
  String version = "1.1.0";

  @JacksonXmlProperty(isAttribute = true, localName = "outputFormat")
  String outputFormat = "application/json";

  @JacksonXmlProperty(isAttribute = true, localName = "viewParams")
  String viewParams;

  @JacksonXmlProperty(namespace = "http://www.opengis.net/wfs", localName = "Query")
  GeoQuery query;

  public GetFeature() {
  }

  public GetFeature(GeoQuery query) {
    this.query = query;
    if(query.getExtension() != null) {
      this.viewParams = query.getExtension().toParamString();
    }
  }

  public GetFeature(GeoQuery query, String viewParams) {
    this.query = query;
    this.viewParams = viewParams;
  }

  public String getService() {
    return service;
  }

  public String getVersion() {
    return version;
  }

  public String getOutputFormat() {
    return outputFormat;
  }

  public String getViewParams() {
    return viewParams;
  }

  public GeoQuery getQuery() {
    return query;
  }
}
