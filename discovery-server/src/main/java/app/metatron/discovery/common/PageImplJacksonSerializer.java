package app.metatron.discovery.common;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Sort;

import java.io.IOException;

public class PageImplJacksonSerializer extends JsonSerializer<PageImpl> {

  @Override
  public void serialize(PageImpl page, JsonGenerator jsonGenerator, SerializerProvider serializerProvider)
          throws IOException {

    jsonGenerator.writeStartObject();

    jsonGenerator.writeObjectField("content", page.getContent());

    jsonGenerator.writeObjectFieldStart("page");
    jsonGenerator.writeBooleanField("first", page.isFirst());
    jsonGenerator.writeBooleanField("last", page.isLast());
    jsonGenerator.writeNumberField("totalPages", page.getTotalPages());
    jsonGenerator.writeNumberField("totalElements", page.getTotalElements());
    jsonGenerator.writeNumberField("numberOfElements", page.getNumberOfElements());
    jsonGenerator.writeNumberField("size", page.getSize());
    jsonGenerator.writeNumberField("number", page.getNumber());
    jsonGenerator.writeEndObject();

    Sort sort = page.getSort();
    if (sort != null) {
      jsonGenerator.writeArrayFieldStart("sort");
      for (Sort.Order order : sort) {
        jsonGenerator.writeStartObject();
        jsonGenerator.writeStringField("property", order.getProperty());
        jsonGenerator.writeStringField("direction", order.getDirection().name());
        jsonGenerator.writeEndObject();
      }
      jsonGenerator.writeEndArray();
    }

    jsonGenerator.writeEndObject();

  }

  @Override
  public Class<PageImpl> handledType() {
    return PageImpl.class;
  }
}
