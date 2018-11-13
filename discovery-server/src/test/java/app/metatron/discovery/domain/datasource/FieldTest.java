package app.metatron.discovery.domain.datasource;

import com.vividsolutions.jts.util.Assert;

import org.junit.Test;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.datasource.DataType;
import app.metatron.discovery.domain.workbook.configurations.format.CustomDateTimeFormat;
import app.metatron.discovery.domain.workbook.configurations.format.TimeFieldFormat;
import app.metatron.discovery.domain.workbook.configurations.format.UnixTimeFormat;

import static app.metatron.discovery.domain.datasource.Field.FieldRole.TIMESTAMP;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;

public class FieldTest {

  @Test
  public void getTimeFormat() {
    Field timestampField_format_null = new Field("time", DataType.TIMESTAMP, TIMESTAMP, 0L);
    assertNull(timestampField_format_null.getTimeFormat());

    Field timestampField_plan_text_format = new Field("time", DataType.TIMESTAMP, TIMESTAMP, 0L);
    timestampField_plan_text_format.setFormat("yyyy-MM-dd");

    assertEquals("yyyy-MM-dd", timestampField_plan_text_format.getTimeFormat());

    Field timestampField_format = new Field("time", DataType.TIMESTAMP, TIMESTAMP, 0L);
    timestampField_format.setFormat(GlobalObjectMapper.writeValueAsString(new CustomDateTimeFormat("yyyy-MM-dd")));

    assertEquals("yyyy-MM-dd", timestampField_plan_text_format.getTimeFormat());

    Field timestampField_unix = new Field("time", DataType.TIMESTAMP, TIMESTAMP, 0L);
    timestampField_unix.setFormat(GlobalObjectMapper.writeValueAsString(new UnixTimeFormat()));

    assertEquals(TimeFieldFormat.DEFAULT_DATETIME_FORMAT, timestampField_unix.getTimeFormat());
  }

  @Test
  public void de_serialize() {
    Field timestampField1 = new Field("time", DataType.TIMESTAMP, TIMESTAMP, 0L);
    timestampField1.setFormat("yyyy-MM-dd");

    Field timestampField2 = new Field("time", DataType.TIMESTAMP, TIMESTAMP, 0L);
    timestampField2.setFormat(GlobalObjectMapper.writeValueAsString(new UnixTimeFormat(null, null, null, null)));

    String fieldStr1 = GlobalObjectMapper.writeValueAsString(timestampField1);
    String fieldStr2 = GlobalObjectMapper.writeValueAsString(timestampField2);

    Field serializedField1 = GlobalObjectMapper.readValue(fieldStr1, Field.class);
    Assert.equals(timestampField1.getTimeFormat(), serializedField1.getTimeFormat());

    Field serializedField2 = GlobalObjectMapper.readValue(fieldStr2, Field.class);
    Assert.equals(timestampField2.getFormat(), serializedField2.getFormat());

    System.out.println(fieldStr2);
  }

}