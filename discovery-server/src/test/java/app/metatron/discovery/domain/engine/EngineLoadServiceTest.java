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

package app.metatron.discovery.domain.engine;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Map;

import app.metatron.discovery.AbstractIntegrationTest;
import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.datasource.DataType;
import app.metatron.discovery.domain.dataconnection.DataConnection;
import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.domain.datasource.DataSourceTemporary;
import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.datasource.ingestion.file.CsvFileFormat;
import app.metatron.discovery.domain.datasource.ingestion.jdbc.JdbcIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.jdbc.LinkIngestionInfo;

import static app.metatron.discovery.domain.datasource.DataSource.ConnectionType.LINK;
import static app.metatron.discovery.domain.datasource.DataSource.DataSourceType.MASTER;
import static app.metatron.discovery.domain.datasource.DataSource.GranularityType.DAY;
import static app.metatron.discovery.domain.datasource.DataSource.GranularityType.MONTH;
import static app.metatron.discovery.domain.datasource.DataSource.SourceType.JDBC;
import static app.metatron.discovery.domain.datasource.Field.FieldRole.DIMENSION;
import static app.metatron.discovery.domain.datasource.Field.FieldRole.MEASURE;
import static app.metatron.discovery.domain.datasource.Field.FieldRole.TIMESTAMP;

public class EngineLoadServiceTest extends AbstractIntegrationTest {

  @Autowired
  EngineLoadService engineLoadService;

  @Test
  public void load() throws Exception {

    DataSource dataSource = new DataSource();
    dataSource.setName("bulk_ingestion");
    dataSource.setEngineName("bulk_ingestion");
    dataSource.setDsType(MASTER);
    dataSource.setConnType(LINK);
    dataSource.setGranularity(DAY);
    dataSource.setSegGranularity(MONTH);
    dataSource.setSrcType(JDBC);

    // Add Connection Info

    DataConnection dataConnection = new DataConnection("MYSQL");
    dataConnection.setHostname("localhost");
    dataConnection.setPort(3306);
    dataConnection.setUsername("polaris");
    dataConnection.setPassword("polaris");
    dataConnection.setDatabase("polaris_datasources");

    dataSource.setConnection(dataConnection);

    List<Field> fields = Lists.newArrayList();
    fields.add(new Field("time", DataType.TIMESTAMP, TIMESTAMP, 0L));
    fields.add(new Field("d", DataType.STRING, DIMENSION, 1L));
    fields.add(new Field("sd", DataType.STRING, DIMENSION, 2L));
    fields.add(new Field("m1", DataType.DOUBLE, MEASURE, 3L));
    fields.add(new Field("m2", DataType.DOUBLE, MEASURE, 4L));

    dataSource.setFields(fields);

    LinkIngestionInfo ingestionInfo = new LinkIngestionInfo();

    ingestionInfo.setDataType(JdbcIngestionInfo.DataType.TABLE);
    ingestionInfo.setDatabase("polaris_datasources");
    ingestionInfo.setQuery("sample_ingestion");
    ingestionInfo.setFormat(new CsvFileFormat());
    Map<String, Object> tuningOption = Maps.newHashMap();
    tuningOption.put("a", "d");
    tuningOption.put("b", "c");
    ingestionInfo.setTuningOptions(tuningOption);

    dataSource.setIngestion(GlobalObjectMapper.writeValueAsString(ingestionInfo));

    DataSourceTemporary temporary = engineLoadService.load(dataSource, null);

    System.out.println(temporary);
  }

  @Test
  public void findLoadDataSourceNames() throws Exception {
    System.out.println(engineLoadService.findLoadDataSourceNames());
  }

  @Test
  public void deleteLoadDataSource() throws Exception {
    engineLoadService.deleteLoadDataSource("bulk_ingestion_lziwi");
  }

}
