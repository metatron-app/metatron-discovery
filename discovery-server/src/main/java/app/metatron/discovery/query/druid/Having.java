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

import app.metatron.discovery.query.druid.havings.And;
import app.metatron.discovery.query.druid.havings.DimSelector;
import app.metatron.discovery.query.druid.havings.EqualTo;
import app.metatron.discovery.query.druid.havings.GreaterThan;
import app.metatron.discovery.query.druid.havings.GreaterThanOrEqual;
import app.metatron.discovery.query.druid.havings.LessThan;
import app.metatron.discovery.query.druid.havings.LessThanOrEqual;
import app.metatron.discovery.query.druid.havings.Not;
import app.metatron.discovery.query.druid.havings.Or;

@JsonTypeInfo(use=JsonTypeInfo.Id.NAME, include= JsonTypeInfo.As.EXTERNAL_PROPERTY, property="type")
@JsonSubTypes({
    @JsonSubTypes.Type(value = GreaterThan.class, name = "greaterThan"),
    @JsonSubTypes.Type(value = EqualTo.class, name = "equalTo"),
    @JsonSubTypes.Type(value = GreaterThanOrEqual.class, name = "greaterThanOrEqualTo"),
    @JsonSubTypes.Type(value = LessThanOrEqual.class, name = "lessThanOrEqualTo"),
    @JsonSubTypes.Type(value = LessThan.class, name = "lessThan"),
    @JsonSubTypes.Type(value = DimSelector.class, name = "dimSelector"),
    @JsonSubTypes.Type(value = And.class, name = "and"),
    @JsonSubTypes.Type(value = Or.class, name = "or"),
    @JsonSubTypes.Type(value = Not.class, name = "not")
})
public interface Having {
}
