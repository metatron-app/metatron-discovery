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

import app.metatron.discovery.query.druid.postaggregations.ArithmeticPostAggregation;
import app.metatron.discovery.query.druid.postaggregations.ConstantPostAggregator;
import app.metatron.discovery.query.druid.postaggregations.ExprPostAggregator;
import app.metatron.discovery.query.druid.postaggregations.FieldAccessorPostAggregator;
import app.metatron.discovery.query.druid.postaggregations.HyperUniqueCardinalityPostAggregator;
import app.metatron.discovery.query.druid.postaggregations.JavaScriptPostAggregator;
import app.metatron.discovery.query.druid.postaggregations.MathPostAggregator;
import app.metatron.discovery.query.druid.postaggregations.MedianPostAggregator;
import app.metatron.discovery.query.druid.postaggregations.SketchQuantilePostAggregator;

/**
 * Created by i1befree on 2016. 1. 11..
 */
@JsonTypeInfo(use=JsonTypeInfo.Id.NAME, include= JsonTypeInfo.As.EXTERNAL_PROPERTY, property="type")
@JsonSubTypes({
        @JsonSubTypes.Type(value = ArithmeticPostAggregation.class, name = "arithmetic"),
        @JsonSubTypes.Type(value = ExprPostAggregator.class, name = "expr"),
        @JsonSubTypes.Type(value = ConstantPostAggregator.class, name = "constant"),
        @JsonSubTypes.Type(value = FieldAccessorPostAggregator.class, name = "fieldAccess"),
        @JsonSubTypes.Type(value = HyperUniqueCardinalityPostAggregator.class, name = "hyperUniqueCardinality"),
        @JsonSubTypes.Type(value = JavaScriptPostAggregator.class, name = "javascript"),
        @JsonSubTypes.Type(value = MathPostAggregator.class, name = "math"),
        @JsonSubTypes.Type(value = SketchQuantilePostAggregator.class, name = "sketch.quantiles"),
        @JsonSubTypes.Type(value = MedianPostAggregator.class, name = "median")
})
public interface PostAggregation {
    String getName();
}
