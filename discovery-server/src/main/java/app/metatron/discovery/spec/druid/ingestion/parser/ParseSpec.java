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

package app.metatron.discovery.spec.druid.ingestion.parser;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

/**
 * Created by kyungtaak on 2016. 6. 17..
 */
@JsonTypeInfo(use=JsonTypeInfo.Id.NAME, include= JsonTypeInfo.As.EXTERNAL_PROPERTY, property="format")
@JsonSubTypes({
        @JsonSubTypes.Type(value = JsonParseSpec.class, name = "json"),
        @JsonSubTypes.Type(value = CsvParseSpec.class, name = "csv"),
        @JsonSubTypes.Type(value = TsvParseSpec.class, name = "tsv"),
        @JsonSubTypes.Type(value = TimeAndDimsParseSpec.class, name = "timeAndDims")
})
public interface ParseSpec {
}
