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

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.joda.JodaModule;

import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.List;
import java.util.Map;

import static com.fasterxml.jackson.core.JsonParser.Feature.ALLOW_NON_NUMERIC_NUMBERS;
import static com.fasterxml.jackson.core.JsonParser.Feature.ALLOW_SINGLE_QUOTES;

/**
 * Spring Context 에 영향을 받지 않는 클래스 내애서 활용할 ObjectMapper 싱글톤 클래스 생성 <br/>
 *   - 전체 어플리케이션에서 사용하는 공통 ObjectMapper 활용시 getDefaultMapper() 메소드 활용 <br/>
 *   - 추가적으로 설정이 필요한 부분은 클래스 속성을 추가하여 Builder 클래스에 추가 설정을 구성하여 활용 <br/>
 */
@Component
public final class GlobalObjectMapper {

  private static ObjectMapper defaultMapper;

  private static ObjectMapper quoteNonNumericMapper;

  private static ObjectMapper resultSetMapper;

  private GlobalObjectMapper() {
    defaultMapper = getDefaultBuilder().build();
    resultSetMapper = getDefaultBuilder()
        .serializers(new ResultSetSerializer())
        .build();
    quoteNonNumericMapper = getDefaultBuilder()
        .featuresToDisable(JsonGenerator.Feature.QUOTE_NON_NUMERIC_NUMBERS)
        .build();
  }

  private static Jackson2ObjectMapperBuilder getDefaultBuilder() {
    Jackson2ObjectMapperBuilder builder = new Jackson2ObjectMapperBuilder()
        .indentOutput(false)
        .createXmlMapper(false)
        .dateFormat(new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSZ"))
        .failOnUnknownProperties(false)
        .featuresToEnable(ALLOW_NON_NUMERIC_NUMBERS)
        .featuresToEnable(ALLOW_SINGLE_QUOTES)
        .serializationInclusion(JsonInclude.Include.NON_NULL)
        .modules(new JodaModule());
    return builder;
  }

  public static ObjectMapper getDefaultMapper() {
    if (defaultMapper == null) {
      defaultMapper = getDefaultBuilder().build();
    }

    return defaultMapper;
  }

  /**
   * For Logging or Debugging
   */
  public static String writeValueAsString(Object object) {
    if (defaultMapper == null) {
      defaultMapper = getDefaultBuilder().build();
    }

    if (object == null) {
      return null;
    }

    try {
      return defaultMapper.writeValueAsString(object);
    } catch (JsonProcessingException e) {
    }

    return "";
  }

  public static String writeListValueAsString(Object object, Class<?> clazz) {
    if (defaultMapper == null) {
      defaultMapper = getDefaultBuilder().build();
    }

    if (object == null) {
      return null;
    }

    try {
      return defaultMapper.writerFor(defaultMapper.getTypeFactory()
                                                  .constructCollectionType(List.class, clazz))
                          .writeValueAsString(object);
    } catch (JsonProcessingException e) {
    }

    return "";
  }

  /**
   * For Logging or Debugging
   */
  public static <T> T readValue(String content, Class<T> valueType) {

    if (content == null) {
      return null;
    }

    if (defaultMapper == null) {
      defaultMapper = getDefaultBuilder().build();
    }

    try {
      return defaultMapper.readValue(content, valueType);
    } catch (IOException e) {
    }

    return null;
  }

  public static <T> List<T> readListValue(String content, Class<T> valueType) {
    if (defaultMapper == null) {
      defaultMapper = getDefaultBuilder().build();
    }

    try {
      return defaultMapper.readValue(content, defaultMapper.getTypeFactory()
                                                           .constructCollectionType(List.class, valueType));
    } catch (IOException e) {
    }

    return null;
  }

  public static <T> T readValue(String content, TypeReference<T> typeReference) {
    if (defaultMapper == null) {
      defaultMapper = getDefaultBuilder().build();
    }

    try {
      return defaultMapper.readValue(content, typeReference);
    } catch (IOException e) {
    }

    return null;
  }

  public static Map readValue(String content) {
    return readValue(content, Map.class);
  }

  public static ObjectMapper getResultSetMapper() {
    if (resultSetMapper == null) {
      resultSetMapper = getDefaultBuilder()
          .serializers(new ResultSetSerializer())
          .build();
    }

    return resultSetMapper;
  }

  public static ObjectMapper getQuoteNonNumericMapper() {
    if (quoteNonNumericMapper == null) {
      quoteNonNumericMapper = getDefaultBuilder()
          .featuresToDisable(JsonGenerator.Feature.QUOTE_NON_NUMERIC_NUMBERS)
          .build();
    }
    return quoteNonNumericMapper;
  }
}
