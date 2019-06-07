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

package app.metatron.discovery.spec.druid.ingestion.parser;

import com.google.common.base.Preconditions;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonValue;

import app.metatron.discovery.common.datasource.DataType;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type", defaultImpl = StringDimensionSchema.class)
@JsonSubTypes(value = {
    @JsonSubTypes.Type(name = "string", value = StringDimensionSchema.class),
    @JsonSubTypes.Type(name = "long", value = LongDimensionSchema.class),
    @JsonSubTypes.Type(name = "double", value = DoubleDimensionSchema.class)
})
public abstract class DimensionSchema {

  public static DimensionSchema of(String name, DataType dataType) {
    switch (dataType) {
      case LONG:
        return new LongDimensionSchema(name);
      case DOUBLE:
        return new DoubleDimensionSchema(name);
      case STRING:
        return new StringDimensionSchema(name);
    }
    throw new IllegalArgumentException("not supported type " + dataType + " (" + name + ")");
  }

  private final String name;

  private final MultiValueHandling multiValueHandling;

  public DimensionSchema(String name, MultiValueHandling multiValueHandling) {
    this.name = Preconditions.checkNotNull(name, "Dimension name cannot be null.");
    this.multiValueHandling = multiValueHandling;
  }

  public String getName() {
    return name;
  }

  public MultiValueHandling getMultiValueHandling() {
    return multiValueHandling;
  }

  @Override
  public String toString() {
    return "DimensionSchema{" +
        ", name='" + name + '\'' +
        ", multiValueHandling=" + multiValueHandling +
        '}';
  }

  public enum MultiValueHandling {
    SORTED_ARRAY,
    ARRAY,
    SET;

    @Override
    @JsonValue
    public String toString() {
      return this.name().toUpperCase();
    }

    @JsonCreator
    public static MultiValueHandling fromString(String name) {
      return valueOf(name.toUpperCase());
    }
  }
}
