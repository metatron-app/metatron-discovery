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

import app.metatron.discovery.query.druid.searches.AllSearchQuerySpec;
import app.metatron.discovery.query.druid.searches.FragmentSearchQuerySpec;
import app.metatron.discovery.query.druid.searches.InsensitiveContainsSearchQuerySpec;
import app.metatron.discovery.query.druid.searches.RegexSearchQuerySpec;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.EXTERNAL_PROPERTY, property = "type")
@JsonSubTypes({
    @JsonSubTypes.Type(value = AllSearchQuerySpec.class, name = "all"),
    @JsonSubTypes.Type(value = InsensitiveContainsSearchQuerySpec.class, name = "insensitive_contains"),
    @JsonSubTypes.Type(value = FragmentSearchQuerySpec.class, name = "fragment"),
    @JsonSubTypes.Type(value = RegexSearchQuerySpec.class, name = "regex")
})
public interface SearchQuerySpec {
}
