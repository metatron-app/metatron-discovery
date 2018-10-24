package app.metatron.discovery.spec.druid.ingestion.parser;

import com.google.common.collect.Lists;

import org.junit.Test;

import java.util.List;

import app.metatron.discovery.common.GlobalObjectMapper;

import static org.junit.Assert.assertEquals;

public class JsonFlattenFieldTest {

  @Test
  public void de_serialize() {

    JsonFlattenField.RootFlattenField rootField = new JsonFlattenField.RootFlattenField("rootField");
    JsonFlattenField.PathFlattenField pathField = new JsonFlattenField.PathFlattenField("pathField", "$.field.test");
    JsonFlattenField.JQFlattenField jqField = new JsonFlattenField.JQFlattenField("jqField", ".field.test");

    List<JsonFlattenField> jsonFlattenFields = Lists.newArrayList();
    jsonFlattenFields.add(rootField);
    jsonFlattenFields.add(pathField);
    jsonFlattenFields.add(jqField);

    String serialized = GlobalObjectMapper.writeListValueAsString(jsonFlattenFields, JsonFlattenField.class);
//    System.out.println(serialized);

    List<JsonFlattenField> deJsonFlattenFields = GlobalObjectMapper.readListValue(serialized, JsonFlattenField.class);

    assertEquals(rootField.getName(), deJsonFlattenFields.get(0).getName());
    assertEquals(pathField.getName(), deJsonFlattenFields.get(1).getName());
    assertEquals(jqField.getName(), deJsonFlattenFields.get(2).getName());
  }
}