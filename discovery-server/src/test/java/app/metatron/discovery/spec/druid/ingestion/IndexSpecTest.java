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

package app.metatron.discovery.spec.druid.ingestion;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import com.jayway.jsonpath.DocumentContext;
import com.jayway.jsonpath.JsonPath;
import com.jayway.jsonpath.PathNotFoundException;

import org.junit.Test;

import java.util.List;
import java.util.Map;

import app.metatron.discovery.TestUtils;
import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.datasource.DataType;
import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.datasource.ingestion.HiveIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.file.OrcFileFormat;
import app.metatron.discovery.domain.datasource.ingestion.file.ParquetFileFormat;
import app.metatron.discovery.spec.druid.ingestion.index.IndexSpec;
import app.metatron.discovery.util.PolarisUtils;

import static app.metatron.discovery.domain.datasource.DataSource.ConnectionType.ENGINE;
import static app.metatron.discovery.domain.datasource.DataSource.DataSourceType.MASTER;
import static app.metatron.discovery.domain.datasource.DataSource.GranularityType.DAY;
import static app.metatron.discovery.domain.datasource.DataSource.SourceType.HIVE;
import static app.metatron.discovery.domain.datasource.Field.FieldRole.DIMENSION;
import static app.metatron.discovery.domain.datasource.Field.FieldRole.MEASURE;
import static app.metatron.discovery.domain.datasource.Field.FieldRole.TIMESTAMP;
import static org.hamcrest.core.Is.is;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;

public class IndexSpecTest {

  @Test
  public void orcTypeSpecTest() {

    String sourceTable = "default.sample_ingestion_partition_parti_orc";

    DataSource dataSource = new DataSource();
    dataSource.setName("Hive Ingestion orc partition " + PolarisUtils.randomString(5));
    dataSource.setDsType(MASTER);
    dataSource.setConnType(ENGINE);
    dataSource.setGranularity(DAY);
    dataSource.setSegGranularity(DAY);
    dataSource.setSrcType(HIVE);

    List<Field> fields = Lists.newArrayList();
    fields.add(new Field("time", DataType.TIMESTAMP, TIMESTAMP, 0L));
    fields.add(new Field("d", DataType.STRING, DIMENSION, 1L));
    fields.add(new Field("sd", DataType.STRING, DIMENSION, 2L));
    fields.add(new Field("m1", DataType.DOUBLE, MEASURE, 3L));
    fields.add(new Field("m2", DataType.DOUBLE, MEASURE, 4L));
    dataSource.setFields(fields);

    Map<String, Object> context = Maps.newHashMap();

    List<String> intervals = Lists.newArrayList("2017-01-01/2017-12-01");

    List<Map<String, Object>> partitions = Lists.newArrayList();
    partitions.add(TestUtils.makeMap("ym", "201704"));

    HiveIngestionInfo hiveIngestionInfo = new HiveIngestionInfo(
        new OrcFileFormat(), //new CsvFileFormat(),
        sourceTable,
        partitions,
        null,
        null,
        intervals,
        context);

    dataSource.setIngestion(GlobalObjectMapper.writeValueAsString(hiveIngestionInfo));

    IngestionSpecBuilder ingestionSpecBuilder = new IngestionSpecBuilder();
    IngestionSpec ingestionSpec = ingestionSpecBuilder.dataSchema(dataSource)
                                                      .hiveIoConfig(hiveIngestionInfo.getSource(), null, null, null)
                                                      .build();

    System.out.println(GlobalObjectMapper.writeValueAsString(ingestionSpec));

    DocumentContext jsonContext = JsonPath.parse(GlobalObjectMapper.writeValueAsString(ingestionSpec));

    assertThat(jsonContext.read("$['ioConfig']['type']"), is("hadoop"));
    assertThat(jsonContext.read("$['dataSchema']['parser']['type']"), is("orc"));

    boolean thrown = false;
    try {
      jsonContext.read("$['ioConfig']['inputSpec']['typeString']");
    } catch (PathNotFoundException e) {
      thrown = true;
    }
    assertTrue(thrown);

  }

  @Test
  public void parquetTypeSpecTest() {
    String sourceTable = "default.sample_ingestion_parquet";

    DataSource dataSource = new DataSource();
    dataSource.setName("Hive Ingestion parquet partition " + PolarisUtils.randomString(5));
    dataSource.setDsType(MASTER);
    dataSource.setConnType(ENGINE);
    dataSource.setGranularity(DAY);
    dataSource.setSegGranularity(DAY);
    dataSource.setSrcType(HIVE);

    List<Field> fields = Lists.newArrayList();
    fields.add(new Field("time", DataType.TIMESTAMP, TIMESTAMP, 0L));
    fields.add(new Field("d", DataType.STRING, DIMENSION, 1L));
    fields.add(new Field("sd", DataType.STRING, DIMENSION, 2L));
    fields.add(new Field("m1", DataType.DOUBLE, MEASURE, 3L));
    fields.add(new Field("m2", DataType.DOUBLE, MEASURE, 4L));
    dataSource.setFields(fields);

    Map<String, Object> context = Maps.newHashMap();

    List<String> intervals = Lists.newArrayList("2017-01-01/2017-12-01");

    List<Map<String, Object>> partitions = Lists.newArrayList();
    partitions.add(TestUtils.makeMap("ym", "201704"));

    HiveIngestionInfo hiveIngestionInfo = new HiveIngestionInfo(
        new ParquetFileFormat(), //new CsvFileFormat(),
        sourceTable,
        partitions,
        null,
        null,
        intervals,
        context);

    dataSource.setIngestion(GlobalObjectMapper.writeValueAsString(hiveIngestionInfo));

    IngestionSpecBuilder ingestionSpecBuilder = new IngestionSpecBuilder();
    IngestionSpec ingestionSpec = ingestionSpecBuilder.dataSchema(dataSource)
                                                      .hiveIoConfig(hiveIngestionInfo.getSource(), null, null, null)
                                                      .build();

    System.out.println(GlobalObjectMapper.writeValueAsString(ingestionSpec));

    DocumentContext jsonContext = JsonPath.parse(GlobalObjectMapper.writeValueAsString(ingestionSpec));

    assertThat(jsonContext.read("$['ioConfig']['type']"), is("hadoop"));
    assertThat(jsonContext.read("$['dataSchema']['parser']['type']"), is("map"));
    assertThat(jsonContext.read("$['dataSchema']['parser']['parseSpec']['timestampSpec']['replaceWrongColumn']"), is(false));

    boolean thrown = false;
    try {
      jsonContext.read("$['ioConfig']['inputSpec']['typeString']");
    } catch (PathNotFoundException e) {
      thrown = true;
    }
    assertTrue(thrown);
  }

  @Test
  public void BatchTuningConfigTest() {
    IngestionSpecBuilder ingestionSpecBuilder = new IngestionSpecBuilder();
    Map<String, Object> tuningProperties = Maps.newHashMap();
    tuningProperties.put("workingPath", "data");
    tuningProperties.put("ignoreInvalidRows", true);

    IndexSpec indexSpec = new IndexSpec();
    indexSpec.setAllowNullForNumbers(true);

    tuningProperties.put("indexSpec", indexSpec);

    IngestionSpec ingestionSpec = ingestionSpecBuilder.batchTuningConfig(tuningProperties).build();

    String s = GlobalObjectMapper.writeValueAsString(ingestionSpec);

    System.out.println(s);

    DocumentContext jsonContext = JsonPath.parse(s);

    assertThat(jsonContext.read("$['tuningConfig']['type']"), is("index"));
    assertThat(jsonContext.read("$['tuningConfig']['workingPath']"), is("data"));
    assertThat(jsonContext.read("$['tuningConfig']['indexSpec']['allowNullForNumbers']"), is(true));

  }

  @Test
  public void HdfsTuningConfigTest() {
    IngestionSpecBuilder ingestionSpecBuilder = new IngestionSpecBuilder();

    Map<String, Object> tuningProperties = Maps.newHashMap();
    tuningProperties.put("ignoreInvalidRows", true);

    IndexSpec indexSpec = new IndexSpec();
    indexSpec.setAllowNullForNumbers(true);

    tuningProperties.put("indexSpec", indexSpec);

    Map<String, Object> jobProperties = Maps.newHashMap();
    jobProperties.put("abc", "def");
    jobProperties.put("mapreduce.map.memory.mb", 1024);

    IngestionSpec ingestionSpec = ingestionSpecBuilder.hdfsTuningConfig(tuningProperties, jobProperties).build();

    String s = GlobalObjectMapper.writeValueAsString(ingestionSpec);

    System.out.println(s);

    DocumentContext jsonContext = JsonPath.parse(s);

    assertThat(jsonContext.read("$['tuningConfig']['type']"), is("hadoop"));
    assertThat(jsonContext.read("$['tuningConfig']['ignoreInvalidRows']"), is(true));
    assertThat(jsonContext.read("$['tuningConfig']['indexSpec']['allowNullForNumbers']"), is(true));
    assertThat(jsonContext.read("$['tuningConfig']['jobProperties']['mapreduce.map.memory.mb']"), is("1024"));

  }

  @Test
  public void HiveTuningConfigTest() {
    IngestionSpecBuilder ingestionSpecBuilder = new IngestionSpecBuilder();

    Map<String, Object> tuningProperties = Maps.newHashMap();
    tuningProperties.put("ignoreInvalidRows", true);

    IndexSpec indexSpec = new IndexSpec();
    indexSpec.setAllowNullForNumbers(true);

    tuningProperties.put("indexSpec", indexSpec);
    tuningProperties.put("mapSplitSize", "512MB");

    Map<String, Object> jobProperties = Maps.newHashMap();
    jobProperties.put("abc", "def");
    jobProperties.put("mapreduce.map.memory.mb", 1024);

    IngestionSpec ingestionSpec = ingestionSpecBuilder.hiveTuningConfig(tuningProperties, jobProperties).build();

    String s = GlobalObjectMapper.writeValueAsString(ingestionSpec);

    System.out.println(s);

    DocumentContext jsonContext = JsonPath.parse(s);

    assertThat(jsonContext.read("$['tuningConfig']['type']"), is("hadoop"));
    assertThat(jsonContext.read("$['tuningConfig']['ignoreInvalidRows']"), is(true));
    assertThat(jsonContext.read("$['tuningConfig']['indexSpec']['allowNullForNumbers']"), is(true));
    assertThat(jsonContext.read("$['tuningConfig']['jobProperties']['mapreduce.map.memory.mb']"), is("1024"));

  }

  @Test
  public void KafkaTuningConfigTest() {
    KafkaRealTimeIndexBuilder ingestionSpecBuilder = new KafkaRealTimeIndexBuilder();

    Map<String, Object> tuningProperties = Maps.newHashMap();
    tuningProperties.put("ignoreInvalidRows", true);

    IndexSpec indexSpec = new IndexSpec();
    indexSpec.setAllowNullForNumbers(true);

    tuningProperties.put("indexSpec", indexSpec);

    Map<String, Object> jobProperties = Maps.newHashMap();
    jobProperties.put("abc", "def");

    KafkaRealTimeIndex realTimeIndex = ingestionSpecBuilder.tuningConfig(tuningProperties).build();

    String s = GlobalObjectMapper.writeValueAsString(realTimeIndex);

    System.out.println(s);

    DocumentContext jsonContext = JsonPath.parse(s);

    assertThat(jsonContext.read("$['tuningConfig']['type']"), is("kafka"));
    assertThat(jsonContext.read("$['tuningConfig']['ignoreInvalidRows']"), is(true));
    assertThat(jsonContext.read("$['tuningConfig']['indexSpec']['allowNullForNumbers']"), is(true));

  }

}