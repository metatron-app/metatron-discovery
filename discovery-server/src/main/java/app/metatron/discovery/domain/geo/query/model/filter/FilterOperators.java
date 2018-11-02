package app.metatron.discovery.domain.geo.query.model.filter;

import com.google.common.collect.Lists;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;

import java.util.List;

public abstract class FilterOperators {

  @JacksonXmlProperty(localName = "PropertyIsBetween")
  List<PropertyIsBetween> propertyIsBetweens;

  @JacksonXmlProperty(localName = "PropertyIsEqualTo")
  List<PropertyIsEqualTo> propertyIsEqualTos;

  @JacksonXmlProperty(localName = "PropertyIsLike")
  List<PropertyIsLike> propertyIsLikes;

  @JacksonXmlProperty(localName = "BBOX")
  List<BBox> bbox;

  @JacksonXmlProperty(localName = "And")
  List<AndOperator> andOperators;

  @JacksonXmlProperty(localName = "Or")
  List<OrOperator> orOperators;

  public void addFilter(FilterProperties filterProperties) {
    if(filterProperties instanceof PropertyIsEqualTo) {
      if(propertyIsEqualTos == null) {
        propertyIsEqualTos = Lists.newArrayList();
      }
      propertyIsEqualTos.add((PropertyIsEqualTo) filterProperties);
    } else if(filterProperties instanceof PropertyIsLike) {
      if(propertyIsLikes == null) {
        propertyIsLikes = Lists.newArrayList();
      }
      propertyIsLikes.add((PropertyIsLike) filterProperties);
    } else if(filterProperties instanceof PropertyIsBetween) {
      if(propertyIsBetweens == null) {
        propertyIsBetweens = Lists.newArrayList();
      }
      propertyIsBetweens.add((PropertyIsBetween) filterProperties);
    } else if(filterProperties instanceof BBox) {
      if(bbox == null) {
        bbox = Lists.newArrayList();
      }
      bbox.add((BBox) filterProperties);
    }

  }

  public void addLogicalOperator(LogicalOperator operator) {
    if(operator instanceof AndOperator) {
      if(andOperators == null) {
        andOperators = Lists.newArrayList();
      }
      andOperators.add((AndOperator) operator);
    } else if(operator instanceof OrOperator) {
      if(orOperators == null) {
        orOperators = Lists.newArrayList();
      }
      orOperators.add((OrOperator) operator);
    }

  }
}
