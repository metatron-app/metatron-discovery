package app.metatron.discovery.domain.geo.query.model.extension;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.thymeleaf.util.StringUtils;

import java.util.List;
import java.util.Map;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.query.druid.Aggregation;
import app.metatron.discovery.query.druid.Dimension;
import app.metatron.discovery.query.druid.PostAggregation;
import app.metatron.discovery.query.druid.virtualcolumns.VirtualColumn;

public class AggregationExtension implements DruidExtension {

  private static final Logger LOGGER = LoggerFactory.getLogger(AggregationExtension.class);

  List<VirtualColumn> virtualColumns;

  List<Dimension> dimensions;

  List<Aggregation> aggregators;

  List<PostAggregation> postAggregators;

  String boundary;

  Map<String,Object> boundaryJoin;

  @JsonCreator
  public AggregationExtension(
      @JsonProperty("virtualColumns") List<VirtualColumn> virtualColumns,
      @JsonProperty("dimensions") List<Dimension> dimensions,
      @JsonProperty("aggregators") List<Aggregation> aggregators,
      @JsonProperty("postAggregators") List<PostAggregation> postAggregators,
      @JsonProperty("boundary") String boundary,
      @JsonProperty("boundaryJoin") Map<String,Object> boundaryJoin) {
    this.virtualColumns = virtualColumns;
    this.dimensions = dimensions;
    this.aggregators = aggregators;
    this.postAggregators = postAggregators;
    this.boundary = boundary;
    this.boundaryJoin = boundaryJoin;
  }

  public List<VirtualColumn> getVirtualColumns() {
    return virtualColumns;
  }

  public List<Dimension> getDimensions() {
    return dimensions;
  }

  public List<Aggregation> getAggregators() {
    return aggregators;
  }

  public List<PostAggregation> getPostAggregators() {
    return postAggregators;
  }

  public String getBoundary() {
    return boundary;
  }

  public Map<String, Object> getBoundaryJoin() {
    return boundaryJoin;
  }

  @Override
  public String toParamString() {
    String queryStr = GlobalObjectMapper.writeValueAsString(this);

    LOGGER.debug("Aggregation Extension : " + queryStr);

    queryStr = StringUtils.replace(queryStr, ",", "\\,");

    return "druid:" + queryStr;
  }
}
