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

package app.metatron.discovery.query.druid.postaggregations;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;

import java.util.List;

import javax.validation.constraints.NotNull;

import app.metatron.discovery.query.druid.PostAggregation;

/**
 * Created by hsp on 2016. 3. 24..
 */
@JsonTypeName("arithmetic")
public class ArithmeticPostAggregation implements PostAggregation {


    public enum AggregationFunction {
        @JsonProperty("+")
        PLUS,
        @JsonProperty("-")
        MINUS,
        @JsonProperty("*")
        MULTI,
        @JsonProperty("/")
        DIVISION,
        @JsonProperty("quotient")
        QUOTIENT
    }

    @NotNull
    String name;

    @NotNull
    AggregationFunction fn;

    List<PostAggregation> fields;

    // !!! ordering


    public ArithmeticPostAggregation() {
    }

    public ArithmeticPostAggregation(String name, AggregationFunction fn, List<PostAggregation> fields) {
        this.name = name;
        this.fn = fn;
        this.fields = fields;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public AggregationFunction getFn() {
        return fn;
    }

    public void setFn(AggregationFunction fn) {
        this.fn = fn;
    }

    public List<PostAggregation> getFields() {
        return fields;
    }

    public void setFields(List<PostAggregation> fields) {
        this.fields = fields;
    }
}
