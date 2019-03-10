/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.query.druid;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import app.metatron.discovery.query.druid.aggregations.*;

@JsonTypeInfo(use=JsonTypeInfo.Id.NAME, include= JsonTypeInfo.As.EXTERNAL_PROPERTY, property="type")
@JsonSubTypes({
    @JsonSubTypes.Type(value = CountAggregation.class, name = "count"),
    @JsonSubTypes.Type(value = RelayAggregation.class, name = "relay"),
    @JsonSubTypes.Type(value = LongSumAggregation.class, name = "longSum"),
    @JsonSubTypes.Type(value = DoubleSumAggregation.class, name = "doubleSum"),
    @JsonSubTypes.Type(value = DoubleMinAggregation.class, name = "doubleMin"),
    @JsonSubTypes.Type(value = DoubleMaxAggregation.class, name = "doubleMax"),
    @JsonSubTypes.Type(value = LongMinAggregation.class, name = "longMin"),
    @JsonSubTypes.Type(value = LongMaxAggregation.class, name = "longMax"),
    @JsonSubTypes.Type(value = JavaScriptAggregation.class, name = "javascript"),
    @JsonSubTypes.Type(value = CardinalityAggregation.class, name = "cardinality"),
    @JsonSubTypes.Type(value = SketchAggregation.class, name = "sketch"),
    @JsonSubTypes.Type(value = DistinctSketchAggregation.class, name = "thetaSketch"),
    @JsonSubTypes.Type(value = ApproxHistogramAggregation.class, name = "approxHistogram"),
    @JsonSubTypes.Type(value = ApproxHistogramFoldAggregation.class, name = "approxHistogramFold"),
    @JsonSubTypes.Type(value = FilteredAggregation.class, name = "filtered"),
    @JsonSubTypes.Type(value = EnvelopeAggregation.class, name = "envelope")
})
public interface Aggregation {

    String getName();
}
