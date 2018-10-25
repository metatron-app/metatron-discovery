package app.metatron.discovery.domain.scheduling.engine;

import app.metatron.discovery.AbstractIntegrationTest;
import app.metatron.discovery.TestEngineIngestion;
import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.domain.datasource.DataSourceRepository;
import org.junit.Test;
import org.quartz.JobExecutionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.jdbc.Sql;

import static org.assertj.core.api.Assertions.assertThat;

public class DataSourceCheckJobIntegrationTest extends AbstractIntegrationTest {
  final static String TEST_DATASOURCE_ID = "7b8005ae-eca0-4a56-9072-c3811138c7a6";
  final static String ENGINE_DATASOURCE_NAME = "testsampleds";

  final TestEngineIngestion testEngineIngestion = new TestEngineIngestion();

  @Autowired
  DataSourceCheckJob dataSourceCheckJob;

  @Autowired
  DataSourceRepository dataSourceRepository;

  @Test
  @Sql({"/sql/test_datasource_field.sql"})
  public void executeInternal_isMatchDataSourceSchema_matched() throws InterruptedException, JobExecutionException {
    // given
    setUpTestFixtureEngineDataSource();

    // when
    dataSourceCheckJob.executeInternal(null);

    // then
    DataSource datasource = dataSourceRepository.findOne(TEST_DATASOURCE_ID);
    assertThat(datasource.getFieldsMatched()).isTrue();
  }

  private void setUpTestFixtureEngineDataSource() throws InterruptedException {
    final String workerHost = testEngineIngestion.getEngineWorkerHost();
    final String baseDir = DataSourceCheckJobIntegrationTest.class.getResource("/ingestion/").getPath();
    final String filter = "sample_ingestion.csv";

    final String ingestionSpec = "{\n" +
        "  \"context\": {\n" +
        "    \"druid.task.runner.dedicated.host\": \"" + workerHost + "\"\n" +
        "  },\n" +
        "  \"spec\": {\n" +
        "    \"dataSchema\": {\n" +
        "      \"dataSource\": \"" + ENGINE_DATASOURCE_NAME + "\",\n" +
        "      \"granularitySpec\": {\n" +
        "        \"intervals\": [\n" +
        "          \"1970-01-01/2050-01-01\"\n" +
        "        ],\n" +
        "        \"queryGranularity\": \"DAY\",\n" +
        "        \"rollup\": true,\n" +
        "        \"segmentGranularity\": \"MONTH\",\n" +
        "        \"type\": \"uniform\"\n" +
        "      },\n" +
        "      \"metricsSpec\": [\n" +
        "        {\n" +
        "          \"name\": \"count\",\n" +
        "          \"type\": \"count\"\n" +
        "        },\n" +
        "        {\n" +
        "          \"fieldName\": \"m1\",\n" +
        "          \"inputType\": \"double\",\n" +
        "          \"name\": \"m1\",\n" +
        "          \"type\": \"sum\"\n" +
        "        },\n" +
        "        {\n" +
        "          \"fieldName\": \"m2\",\n" +
        "          \"inputType\": \"double\",\n" +
        "          \"name\": \"m2\",\n" +
        "          \"type\": \"sum\"\n" +
        "        }\n" +
        "      ],\n" +
        "      \"parser\": {\n" +
        "        \"parseSpec\": {\n" +
        "          \"columns\": [\n" +
        "            \"time\",\n" +
        "            \"d\",\n" +
        "            \"sd\",\n" +
        "            \"m1\",\n" +
        "            \"m2\"\n" +
        "          ],\n" +
        "          \"dimensionsSpec\": {\n" +
        "            \"dimensionExclusions\": [],\n" +
        "            \"dimensions\": [\n" +
        "              \"d\",\n" +
        "              \"sd\"\n" +
        "            ],\n" +
        "            \"spatialDimensions\": []\n" +
        "          },\n" +
        "          \"format\": \"csv\",\n" +
        "          \"timestampSpec\": {\n" +
        "            \"column\": \"time\",\n" +
        "            \"format\": \"yyyy-MM-dd\",\n" +
        "            \"replaceWrongColumn\": false\n" +
        "          }\n" +
        "        },\n" +
        "        \"type\": \"string\"\n" +
        "      }\n" +
        "    },\n" +
        "    \"ioConfig\": {\n" +
        "      \"firehose\": {\n" +
        "        \"baseDir\": \"" + baseDir + "\",\n" +
        "        \"filter\": \"" + filter + "\",\n" +
        "        \"type\": \"local\"\n" +
        "      },\n" +
        "      \"type\": \"index\"\n" +
        "    },\n" +
        "    \"tuningConfig\": {\n" +
        "      \"buildV9Directly\": true,\n" +
        "      \"ignoreInvalidRows\": true,\n" +
        "      \"maxRowsInMemory\": 75000,\n" +
        "      \"type\": \"index\"\n" +
        "    }\n" +
        "  },\n" +
        "  \"type\": \"index\"\n" +
        "}";

    testEngineIngestion.ingestionLocalFile(ENGINE_DATASOURCE_NAME, ingestionSpec);
  }

  @Test
  @Sql({"/sql/test_datasource_field.sql"})
  public void executeInternal_isMatchDataSourceSchema_not_matched() throws InterruptedException, JobExecutionException {
    // given
    setUpTestFixtureSchemaNotMatchedEngineDataSource();

    // when
    dataSourceCheckJob.executeInternal(null);

    // then
    DataSource datasource = dataSourceRepository.findOne(TEST_DATASOURCE_ID);
    assertThat(datasource.getFieldsMatched()).isFalse();
  }

  private void setUpTestFixtureSchemaNotMatchedEngineDataSource() throws InterruptedException {
    final String workerHost = testEngineIngestion.getEngineWorkerHost();
    final String baseDir = DataSourceCheckJobIntegrationTest.class.getResource("/ingestion/").getPath();
    final String filter = "sample_ingestion_extends.csv";

    final String ingestionSpec = "{\n" +
        "  \"context\": {\n" +
        "    \"druid.task.runner.dedicated.host\": \"" + workerHost + "\"\n" +
        "  },\n" +
        "  \"spec\": {\n" +
        "    \"dataSchema\": {\n" +
        "      \"dataSource\": \"" + ENGINE_DATASOURCE_NAME + "\",\n" +
        "      \"granularitySpec\": {\n" +
        "        \"intervals\": [\n" +
        "          \"1970-01-01/2050-01-01\"\n" +
        "        ],\n" +
        "        \"queryGranularity\": \"DAY\",\n" +
        "        \"rollup\": true,\n" +
        "        \"segmentGranularity\": \"MONTH\",\n" +
        "        \"type\": \"uniform\"\n" +
        "      },\n" +
        "      \"metricsSpec\": [\n" +
        "        {\n" +
        "          \"name\": \"count\",\n" +
        "          \"type\": \"count\"\n" +
        "        },\n" +
        "        {\n" +
        "          \"fieldName\": \"m1\",\n" +
        "          \"inputType\": \"double\",\n" +
        "          \"name\": \"m1\",\n" +
        "          \"type\": \"sum\"\n" +
        "        },\n" +
        "        {\n" +
        "          \"fieldName\": \"m2\",\n" +
        "          \"inputType\": \"double\",\n" +
        "          \"name\": \"m2\",\n" +
        "          \"type\": \"sum\"\n" +
        "        },\n" +
        "        {\n" +
        "          \"fieldName\": \"m3\",\n" +
        "          \"inputType\": \"double\",\n" +
        "          \"name\": \"m3\",\n" +
        "          \"type\": \"sum\"\n" +
        "        }\n" +
        "      ],\n" +
        "      \"parser\": {\n" +
        "        \"parseSpec\": {\n" +
        "          \"columns\": [\n" +
        "            \"time\",\n" +
        "            \"d\",\n" +
        "            \"sd\",\n" +
        "            \"m1\",\n" +
        "            \"m2\",\n" +
        "            \"m3\",\n" +
        "            \"p\"\n" +
        "          ],\n" +
        "          \"dimensionsSpec\": {\n" +
        "            \"dimensionExclusions\": [],\n" +
        "            \"dimensions\": [\n" +
        "              \"d\",\n" +
        "              \"sd\",\n" +
        "              \"p\"\n" +
        "            ],\n" +
        "            \"spatialDimensions\": []\n" +
        "          },\n" +
        "          \"format\": \"csv\",\n" +
        "          \"timestampSpec\": {\n" +
        "            \"column\": \"time\",\n" +
        "            \"format\": \"yyyy-MM-dd\",\n" +
        "            \"replaceWrongColumn\": false\n" +
        "          }\n" +
        "        },\n" +
        "        \"type\": \"string\"\n" +
        "      }\n" +
        "    },\n" +
        "    \"ioConfig\": {\n" +
        "      \"firehose\": {\n" +
        "        \"baseDir\": \"" + baseDir + "\",\n" +
        "        \"filter\": \"" + filter + "\",\n" +
        "        \"type\": \"local\"\n" +
        "      },\n" +
        "      \"type\": \"index\"\n" +
        "    },\n" +
        "    \"tuningConfig\": {\n" +
        "      \"buildV9Directly\": true,\n" +
        "      \"ignoreInvalidRows\": true,\n" +
        "      \"maxRowsInMemory\": 75000,\n" +
        "      \"type\": \"index\"\n" +
        "    }\n" +
        "  },\n" +
        "  \"type\": \"index\"\n" +
        "}";

    testEngineIngestion.ingestionLocalFile(ENGINE_DATASOURCE_NAME, ingestionSpec);
  }




}