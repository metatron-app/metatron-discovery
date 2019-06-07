/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specic language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.util;

import org.junit.Test;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.datasource.ingestion.IngestionDataResultResponse;

public class CommonsCsvProcessorTest {

  @Test
  public void defaultProcessing() {

    String targetFile = getClass().getClassLoader()
                                  .getResource("csv/crime.csv").getPath();

    CommonsCsvProcessor commonsCsvProcessor = new CommonsCsvProcessor("file://" + targetFile)
        .withHeader(true)
        .totalCount()
        .parse(",");

    IngestionDataResultResponse resultResponse = commonsCsvProcessor.ingestionDataResultResponse();

    System.out.println(GlobalObjectMapper.writeValueAsString(resultResponse));


  }

  @Test
  public void manyColumnProcessing() {

    String targetFile = getClass().getClassLoader()
                                  .getResource("csv/csv_many_column.csv").getPath();

    CommonsCsvProcessor commonsCsvProcessor = new CommonsCsvProcessor("file://" + targetFile)
        .withHeader(true)
        .totalCount()
        .parse(",");

    IngestionDataResultResponse resultResponse = commonsCsvProcessor.ingestionDataResultResponse();

    System.out.println(GlobalObjectMapper.writeValueAsString(resultResponse));


  }

  @Test
  public void duplicatedColumnProcessing() {

    String targetFile = getClass().getClassLoader()
                                  .getResource("csv/duplicated_column.csv").getPath();

    CommonsCsvProcessor commonsCsvProcessor = new CommonsCsvProcessor("file://" + targetFile)
        .withHeader(true)
        .totalCount()
        .parse(",");

    IngestionDataResultResponse resultResponse = commonsCsvProcessor.ingestionDataResultResponse();

    System.out.println(GlobalObjectMapper.writeValueAsString(resultResponse));


  }

  @Test
  public void bomProcessing() {

    String targetFile = getClass().getClassLoader()
                                  .getResource("csv/sale_bom16.csv").getPath();

    CommonsCsvProcessor commonsCsvProcessor = new CommonsCsvProcessor("file://" + targetFile)
        .withHeader(true)
        .totalCount()
        .parse(",");

    IngestionDataResultResponse resultResponse = commonsCsvProcessor.ingestionDataResultResponse();

    System.out.println(GlobalObjectMapper.writeValueAsString(resultResponse));


  }

  @Test
  public void multiLineProcessing() {

    String targetFile = getClass().getClassLoader()
                                  .getResource("csv/multi_line.csv").getPath();

    CommonsCsvProcessor commonsCsvProcessor = new CommonsCsvProcessor("file://" + targetFile)
        .withHeader(true)
        .totalCount()
        .parse(",");

    IngestionDataResultResponse resultResponse = commonsCsvProcessor.ingestionDataResultResponse();

    System.out.println(GlobalObjectMapper.writeValueAsString(resultResponse));


  }

}