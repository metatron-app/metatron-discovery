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

package app.metatron.discovery.query.druid.serializers;


import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.jsontype.TypeSerializer;

import java.io.IOException;

import app.metatron.discovery.query.druid.Granularity;
import app.metatron.discovery.query.druid.granularities.SimpleGranularity;

public class GranularitySerializer extends JsonSerializer<Granularity> {
  @Override
  public void serialize(Granularity granularity, JsonGenerator jsonGenerator, SerializerProvider serializerProvider) throws IOException {
    if(granularity instanceof SimpleGranularity)
      jsonGenerator.writeString(granularity.toString());
    else
      jsonGenerator.writeObject(granularity);
  }

  @Override
  public void serializeWithType(Granularity value, JsonGenerator gen, SerializerProvider serializers, TypeSerializer typeSer) throws IOException {
    serialize(value, gen, serializers);
  }
}
