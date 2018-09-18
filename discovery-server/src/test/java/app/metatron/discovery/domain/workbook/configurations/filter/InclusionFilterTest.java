package app.metatron.discovery.domain.workbook.configurations.filter;

import org.assertj.core.util.Lists;
import org.junit.Test;

import java.io.IOException;

import app.metatron.discovery.common.GlobalObjectMapper;

public class InclusionFilterTest {

  @Test
  public void de_serialize() throws IOException {

    InclusionFilter inFilter = new InclusionFilter();
    inFilter.setDataSource("datasource1");
    inFilter.setField("field1");
    inFilter.setValueList(Lists.newArrayList("value"));
    inFilter.setSort(new InclusionFilter.ItemSort("count", "desc"));

    String specStr = GlobalObjectMapper.writeValueAsString(inFilter);
    System.out.println(specStr);

    InclusionFilter deserializedConfObj = GlobalObjectMapper.getDefaultMapper().readValue(specStr, InclusionFilter.class);

    System.out.println(deserializedConfObj);
  }

}