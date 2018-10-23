package app.metatron.discovery.domain.workbench;

import app.metatron.discovery.TestLocalHdfs;
import app.metatron.discovery.common.datasource.DataType;
import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.datasource.connection.jdbc.HiveConnection;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.security.UserGroupInformation;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.context.junit4.SpringRunner;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Paths;
import java.security.PrivilegedExceptionAction;
import java.util.*;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

public class QueryResultRepositoryHdfsImplTest {
  final String metatronUserId = "testrepouser";

  final TestLocalHdfs testLocalHdfs = new TestLocalHdfs();

  @Before
  public void setUp() throws IOException, InterruptedException {
    testLocalHdfs.delete(new Path(String.format("/tmp/metatron/%s", metatronUserId)));
  }

  @Test
  public void save() throws IOException, InterruptedException {
    // given
    HiveConnection hiveConnection = new HiveConnection();
    hiveConnection.setHdfsConfigurationPath(Paths.get("src/test/hdfs-conf").toAbsolutePath().toString());
    hiveConnection.setPersonalDatabasePrefix("private");
    hiveConnection.setSecondaryUsername("admin");
    hiveConnection.setSecondaryPassword("111");

    String queryEditorId = UUID.randomUUID().toString();

    QueryResult queryResult = new QueryResult();
    queryResult.setFields(Arrays.asList(
        new Field("records.year", DataType.STRING, 0),
        new Field("records.temperature", DataType.INTEGER, 1),
        new Field("records.quality", DataType.INTEGER, 2)));

    List<Map<String,Object>> data = new ArrayList<>();
    Map<String, Object> row1 = new HashMap<>();
    row1.put("records.year", "1990");
    row1.put("records.temperature", 10);
    row1.put("records.quality", 0);
    data.add(row1);
    Map<String, Object> row2 = new HashMap<>();
    row2.put("records.year", "1991");
    row2.put("records.temperature", 20);
    row2.put("records.quality", 1);
    data.add(row2);
    queryResult.setData(data);

    queryResult.setAuditId(UUID.randomUUID().toString());

    // when
    QueryResultRepository queryResultRepository = new QueryResultRepositoryHdfsImpl();
    queryResultRepository.save(hiveConnection, metatronUserId, queryEditorId, queryResult);

    // then
    assertThat(testLocalHdfs.exists(
        new Path(String.format("/tmp/metatron/%s/%s/%s.json", metatronUserId, queryEditorId, queryResult.getAuditId())))
    ).isTrue();

    assertThat(testLocalHdfs.exists(
        new Path(String.format("/tmp/metatron/%s/%s/%s.dat", metatronUserId, queryEditorId, queryResult.getAuditId())))
    ).isTrue();
  }

  @Test
  public void delete() throws IOException, InterruptedException {
    // given
    HiveConnection hiveConnection = new HiveConnection();
    hiveConnection.setHdfsConfigurationPath(Paths.get("src/test/hdfs-conf").toAbsolutePath().toString());
    hiveConnection.setPersonalDatabasePrefix("private");
    hiveConnection.setSecondaryUsername("admin");
    hiveConnection.setSecondaryPassword("111");

    String queryEditorId = UUID.randomUUID().toString();

    String fileContents = "aabbcc11";
    testLocalHdfs.writeFile(hiveConnection.getSecondaryUsername(),
        new Path(String.format("/tmp/metatron/%s/%s", metatronUserId, queryEditorId)),
        String.format("%s.dat", UUID.randomUUID().toString()),
        fileContents);

    // when
    QueryResultRepository queryResultRepository = new QueryResultRepositoryHdfsImpl();
    queryResultRepository.delete(hiveConnection, metatronUserId, queryEditorId);

    // then
    assertThat(testLocalHdfs.exists(
        new Path(String.format("/tmp/metatron/%s/%s", metatronUserId, queryEditorId)))
    ).isFalse();
  }

  @Test
  public void findMetaData() throws IOException, InterruptedException {
    // given
    HiveConnection hiveConnection = new HiveConnection();
    hiveConnection.setHdfsConfigurationPath(Paths.get("src/test/hdfs-conf").toAbsolutePath().toString());
    hiveConnection.setPersonalDatabasePrefix("private");
    hiveConnection.setSecondaryUsername("admin");
    hiveConnection.setSecondaryPassword("111");

    String queryEditorId = UUID.randomUUID().toString();
    String auditId = UUID.randomUUID().toString();

    String headerContents = "[\"records.year\",\"records.temperature\",\"records.quality\"]";
    testLocalHdfs.writeFile(hiveConnection.getSecondaryUsername(),
        new Path(String.format("/tmp/metatron/%s/%s", metatronUserId, queryEditorId)),
        String.format("%s.json", auditId),
        headerContents);

    String dataContents = "1990\00110\0010\n";
    testLocalHdfs.writeFile(hiveConnection.getSecondaryUsername(),
        new Path(String.format("/tmp/metatron/%s/%s", metatronUserId, queryEditorId)),
        String.format("%s.dat", auditId),
        dataContents);

    // when
    QueryResultRepository queryResultRepository = new QueryResultRepositoryHdfsImpl();
    QueryResultMetaData metaData = queryResultRepository.findMetaData(hiveConnection, metatronUserId, queryEditorId, auditId);

    assertThat(metaData.getHeaders()).hasSize(3);
    assertThat(metaData.getHeaders()).contains("records.year", "records.temperature", "records.quality");
    assertThat(metaData.getDataPath()).isEqualTo((
        new Path(
            String.format("/tmp/metatron/%s/%s/%s.dat", metatronUserId, queryEditorId, auditId)
        ).toString())
    );
  }
}