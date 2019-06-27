/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specic language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.workbook.configurations.widget.shelf;

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import org.apache.commons.lang3.StringUtils;

import java.io.Serializable;
import java.util.List;

import app.metatron.discovery.common.datasource.LogicalType;
import app.metatron.discovery.query.druid.Aggregation;
import app.metatron.discovery.query.druid.PostAggregation;
import app.metatron.discovery.query.druid.aggregations.CountAggregation;
import app.metatron.discovery.query.druid.aggregations.GenericSumAggregation;
import app.metatron.discovery.query.druid.aggregations.RelayAggregation;
import app.metatron.discovery.query.druid.postaggregations.ExprPostAggregator;
import app.metatron.discovery.util.EnumUtils;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.EXTERNAL_PROPERTY,
    property = "type",
    defaultImpl = LayerView.OriginalLayerView.class)
@JsonSubTypes({
    @JsonSubTypes.Type(value = LayerView.OriginalLayerView.class, name = "original"),
    @JsonSubTypes.Type(value = LayerView.AbbreviatedView.class, name = "abbr"),
    @JsonSubTypes.Type(value = LayerView.ClusteringLayerView.class, name = "clustering"),
    @JsonSubTypes.Type(value = LayerView.HashLayerView.class, name = "hash")
})
public interface LayerView extends Serializable {

  boolean needAggregation();

  class OriginalLayerView implements LayerView {

    public OriginalLayerView() {
    }

    @Override
    public boolean needAggregation() {
      return false;
    }
  }

  class HashLayerView implements LayerView {
    String method;
    Integer precision;

    public HashLayerView() {
    }

    @JsonCreator
    public HashLayerView(@JsonProperty("method") String method,
                         @JsonProperty("precision") Integer precision) {
      this.method = StringUtils.isEmpty(method) ? "geohex" : method;

      if (precision == null) {
        this.precision = 4;
      } else {
        Preconditions.checkArgument(precision > 0 && precision < 13, "precision value must be between 1 and 12.");
        this.precision = precision;
      }
    }

    public String toHashExpression(String fieldName) {

      List<String> pointKeyList = LogicalType.GEO_POINT.getGeoPointKeys();

      StringBuilder builder = new StringBuilder();
      builder.append("to_").append(method).append("(");
      builder.append(fieldName).append(".").append(pointKeyList.get(0)).append(",");
      builder.append(fieldName).append(".").append(pointKeyList.get(1)).append(",");
      builder.append(precision).append(")");

      return builder.toString();
    }

    public String toWktExpression(String hashColumnName, String geoColumnName) {

      StringBuilder builder = new StringBuilder();
      builder.append(geoColumnName).append("=");
      builder.append(method).append("_to_boundary_wkt").append("(");
      builder.append(hashColumnName).append(")");

      return builder.toString();
    }

    @JsonIgnore
    public List<Aggregation> getClusteringAggregations(String fieldName) {
      List<String> pointKeyList = LogicalType.GEO_POINT.getGeoPointKeys();

      List<Aggregation> aggregations = Lists.newArrayList();
      aggregations.add(new GenericSumAggregation("SUM_LAT", null, fieldName + "." + pointKeyList.get(0), "double"));
      aggregations.add(new GenericSumAggregation("SUM_LON", null, fieldName + "." + pointKeyList.get(1), "double"));
      aggregations.add(new CountAggregation("count"));

      return aggregations;

    }

    @JsonIgnore
    public List<PostAggregation> getClusteringPostAggregations(String geoName) {

      String expr = geoName + " = concat(\'POINT(\', SUM_LON/count, \' \' , SUM_LAT/count, \')\')";

      return Lists.newArrayList(new ExprPostAggregator(expr));

    }

    @Override
    public boolean needAggregation() {
      return true;
    }

    public String getMethod() {
      return method;
    }

    public Integer getPrecision() {
      return precision;
    }
  }


  class AbbreviatedView extends HashLayerView implements LayerView {

    RelayAggregation.Relaytype relayType;

    @JsonCreator
    public AbbreviatedView(@JsonProperty("method") String method,
                           @JsonProperty("precision") Integer precision,
                           @JsonProperty("relayType") String relayType) {
      super(method, precision);
      this.relayType = EnumUtils.getUpperCaseEnum(RelayAggregation.Relaytype.class, relayType);
    }

    public RelayAggregation.Relaytype getRelayType() {
      return relayType;
    }
  }

  class ClusteringLayerView extends HashLayerView implements LayerView {
    String method;
    Integer precision;

    public ClusteringLayerView() {
    }

    @JsonCreator
    public ClusteringLayerView(@JsonProperty("method") String method,
                               @JsonProperty("precision") Integer precision) {
      super(method, precision);
    }

  }

}
