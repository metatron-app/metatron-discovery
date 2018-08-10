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

package app.metatron.discovery.common;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.TreeNode;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;

/**
 * Object 형태의 Json 문자열을 단순 문자열로 Deserialize 수행
 * Usage : @JsonDeserialize(using = KeepAsJsonDeserialzier.class)
 */
public class KeepAsJsonDeserialzier extends JsonDeserializer<String> {

  @Override
  public String deserialize(JsonParser p, DeserializationContext ctxt) throws IOException, JsonProcessingException {
    TreeNode tree = p.getCodec().readTree(p);
    return tree.toString();
  }
}
