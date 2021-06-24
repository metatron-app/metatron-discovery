package app.metatron.discovery.domain.workbook.configurations.filter;

import org.assertj.core.util.Lists;
import org.junit.Test;

import java.io.IOException;

import app.metatron.discovery.common.GlobalObjectMapper;

public class InclusionFilterTest {

  @Test
  public void de_serialize() throws IOException {

    InclusionFilter inFilter = new InclusionFilter("datasource",
                                                   "field",
                                                   null,
                                                   null,
                                                   Lists.newArrayList("value1", "value2"),
                                                   "",
                                                   Lists.newArrayList("candidateValues1", "candidateValues2"),
                                                   Lists.newArrayList("definedValues1", "definedValues2"),
                                                   null,
                                                   new InclusionFilter.ItemSort("count", "desc"),
                                                   true,
                                                   null,
                                                    100);

    String specStr = GlobalObjectMapper.writeValueAsString(inFilter);
    System.out.println(specStr);

    InclusionFilter deserializedConfObj = GlobalObjectMapper.getDefaultMapper().readValue(specStr, InclusionFilter.class);

    System.out.println(deserializedConfObj);
  }

}
