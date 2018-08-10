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

import app.metatron.discovery.query.druid.filters.*;

@JsonTypeInfo(use=JsonTypeInfo.Id.NAME, include= JsonTypeInfo.As.EXTERNAL_PROPERTY, property="type")
@JsonSubTypes({
    @JsonSubTypes.Type(value = AndFilter.class, name = "and"),
    @JsonSubTypes.Type(value = OrFilter.class, name = "or"),
    @JsonSubTypes.Type(value = ExtractionFilter.class, name = "extraction"),
    @JsonSubTypes.Type(value = JavaScriptFilter.class, name = "javascript"),
    @JsonSubTypes.Type(value = NotFilter.class, name = "not"),
    @JsonSubTypes.Type(value = RegExpFilter.class, name = "regex"),
    @JsonSubTypes.Type(value = SearchFilter.class, name = "search"),
    @JsonSubTypes.Type(value = SelectorFilter.class, name = "selector"),
    @JsonSubTypes.Type(value = RangeFilter.class, name = "bound"),
    @JsonSubTypes.Type(value = InFilter.class, name = "in"),
    @JsonSubTypes.Type(value = ExprFilter.class, name = "expr"),
    @JsonSubTypes.Type(value = MathFilter.class, name = "math")
})
public interface Filter {
}
