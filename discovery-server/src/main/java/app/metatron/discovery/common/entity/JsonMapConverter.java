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

package app.metatron.discovery.common.entity;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import javax.persistence.AttributeConverter;
import java.io.IOException;

/**
 * Created by kyungtaak on 2016. 5. 10..
 */
public class JsonMapConverter implements AttributeConverter<Object, String> {

  private static final ObjectMapper om = new ObjectMapper();

  @Override
  public String convertToDatabaseColumn(Object attribute) {

    try {
      return om.writeValueAsString(attribute);
    } catch (JsonProcessingException ex) {
      //log.error("Error while transforming Object to a text datatable column as json string", ex);
      return null;
    }
  }

  @Override
  public Object convertToEntityAttribute(String dbData) {
    try {
      if(dbData != null){
        return om.readValue(dbData, Object.class);
      }
      return dbData;
    } catch (IOException ex) {
      //log.error("IO exception while transforming json text column in Object property", ex);
      return null;
    }
  }
}
