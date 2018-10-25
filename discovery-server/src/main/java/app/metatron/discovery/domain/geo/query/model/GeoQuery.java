package app.metatron.discovery.domain.geo.query.model;

import com.google.common.collect.Lists;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;

import java.util.List;
import java.util.Map;

import app.metatron.discovery.domain.geo.query.model.extension.DruidExtension;
import app.metatron.discovery.domain.geo.query.model.filter.GeoFilter;
import app.metatron.discovery.domain.workbook.configurations.datasource.DataSource;
import app.metatron.discovery.query.druid.Query;

@JacksonXmlRootElement(namespace = "http://www.opengis.net/wfs")
public class GeoQuery extends Query {

  public final static String PREFIX_TYPE_NAME = "metatron:";

  @JacksonXmlProperty(isAttribute = true, localName = "typeName")
  String typeName;

  @JacksonXmlProperty(isAttribute = true, localName = "srsName")
  String srsName;

  @JacksonXmlProperty(isAttribute = true, namespace = "http://openstreemap.org", localName = "outputFormat")
  String outputFormat = "application/json";

  @JacksonXmlProperty(localName = "PropertyName")
  List<PropertyName> propertyNames;

  @JacksonXmlProperty(localName = "Filter")
  GeoFilter filter;

  @JsonIgnore
  DruidExtension extension;

  @JsonIgnore
  Map<String, String> projectionMapper;

  @JsonIgnore
  List<String> minMaxFields;

  @JsonIgnore
  Integer limit;

  public GeoQuery() {
  }

  public GeoQuery(String typeName, String srsName) {
    this.typeName = typeName;
    this.srsName = srsName;
  }

  public void addPropertyName(PropertyName... propertyNames) {
    if(this.propertyNames == null) {
      this.propertyNames = Lists.newArrayList();
    }

    this.propertyNames.addAll(Lists.newArrayList(propertyNames));
  }

  public static GeoQueryBuilder builder(DataSource dataSource) {
    return new GeoQueryBuilder(dataSource);
  }

  public String getTypeName() {
    return typeName;
  }

  public String getSrsName() {
    return srsName;
  }

  public String getOutputFormat() {
    return outputFormat;
  }

  public GeoFilter getFilter() {
    return filter;
  }

  public void setFilter(GeoFilter filter) {
    this.filter = filter;
  }

  public DruidExtension getExtension() {
    return extension;
  }

  public void setExtension(DruidExtension extension) {
    this.extension = extension;
  }

  public Map<String, String> getProjectionMapper() {
    return projectionMapper;
  }

  public void setProjectionMapper(Map<String, String> projectionMapper) {
    this.projectionMapper = projectionMapper;
  }

  public List<String> getMinMaxFields() {
    return minMaxFields;
  }

  public void setMinMaxFields(List<String> minMaxFields) {
    this.minMaxFields = minMaxFields;
  }

  public Integer getLimit() {
    return limit;
  }

  public void setLimit(Integer limit) {
    this.limit = limit;
  }
}
