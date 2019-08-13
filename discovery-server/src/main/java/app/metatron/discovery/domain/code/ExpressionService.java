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

package app.metatron.discovery.domain.code;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import javax.annotation.PostConstruct;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.datasource.ingestion.IngestionDataResultResponse;
import app.metatron.discovery.util.CommonsCsvProcessor;

@Component
public class ExpressionService {

  private static final Logger LOGGER = LoggerFactory.getLogger(ExpressionService.class);

  private List<CommonCode> commonCodeList = new ArrayList<>();

  @PostConstruct
  public void setup() {
    try {
      CommonsCsvProcessor commonsCsvProcessor = new CommonsCsvProcessor(getClass().getClassLoader()
                                                                                  .getResource("templates/expression/expressions.csv").toURI())
          .withHeader(true)
          .maxRowCount(143L)
          .parse(",");

      IngestionDataResultResponse resultResponse = commonsCsvProcessor.ingestionDataResultResponse();

      commonCodeList = Arrays.asList(GlobalObjectMapper.readValue(GlobalObjectMapper.writeValueAsString(resultResponse.getData()), CommonCode[].class));
    } catch (URISyntaxException e) {
      LOGGER.error(e.getMessage());
    }

  }

  public List<CommonCode> getCommonCodeList() {
    return commonCodeList;
  }

}
