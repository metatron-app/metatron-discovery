package app.metatron.discovery.spec.druid.ingestion.parser;

import com.google.common.collect.Lists;

import org.junit.Test;

import java.util.List;

import app.metatron.discovery.domain.datasource.ingestion.file.JsonFileFormat;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class JsonParseSpecTest {

  @Test
  public void setFlattenSpec() {
    List<JsonFileFormat.JsonFlatten> flattens = Lists.newArrayList();
    flattens.add(new JsonFileFormat.JsonFlatten("field1.a", "$.field1.a"));
    flattens.add(new JsonFileFormat.JsonFlatten("field1.b", "$.field1.b"));

    JsonParseSpec spec = new JsonParseSpec();
    spec.setFlattenSpec(flattens);

    List<JsonFlattenField> fields = spec.getFlattenSpec().getFields();

    for(int i = 0; i<fields.size(); i++) {
      assertTrue(fields.get(i) instanceof JsonFlattenField.PathFlattenField);
      assertEquals(fields.get(i).getName(), flattens.get(i).getName());
      assertEquals(fields.get(i).getExpr(), flattens.get(i).getExpr());
    }

    // System.out.println(GlobalObjectMapper.writeValueAsString(spec));
  }
}