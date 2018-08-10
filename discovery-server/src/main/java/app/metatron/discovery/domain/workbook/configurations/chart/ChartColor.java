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

package app.metatron.discovery.domain.workbook.configurations.chart;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import java.io.Serializable;

/**
 * Created by kyungtaak on 2016. 4. 16..
 */
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.EXTERNAL_PROPERTY, property = "type")
@JsonSubTypes({
        @JsonSubTypes.Type(value = ChartColorBySingle.class, name = "single"),       // 단색 - 사용 안함
        @JsonSubTypes.Type(value = ChartColorByDimension.class, name = "dimension"), // 차원값 시리즈 기준
        @JsonSubTypes.Type(value = ChartColorBySeries.class, name = "series"),        // 시리즈 기준
        @JsonSubTypes.Type(value = ChartColorByMeasure.class, name = "measure")         // 측정값 시리즈 기준
})
public interface ChartColor extends Serializable {
}
