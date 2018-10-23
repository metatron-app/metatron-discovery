package app.metatron.discovery.domain.workbench;

import app.metatron.discovery.domain.datasource.connection.jdbc.HiveConnection;
import app.metatron.discovery.domain.workbench.dto.SavingTable;
import org.junit.Test;

import java.nio.file.Paths;
import java.util.Arrays;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.stub;


public class HiveSqlScriptGeneratorTest {

  @Test
  public void generateSaveAsTable() {
    // given
    HiveConnection hiveConnection = new HiveConnection();
    hiveConnection.setUsername("read_only");
    hiveConnection.setPassword("1111");
    hiveConnection.setSecondaryUsername("hive_admin");
    hiveConnection.setSecondaryPassword("1111");
    hiveConnection.setHostname("localhost");
    hiveConnection.setPort(10000);
    hiveConnection.setPersonalDatabasePrefix("private");
    hiveConnection.setHdfsConfigurationPath(Paths.get("src/test/hdfs-conf").toAbsolutePath().toString());

    SavingTable savingTable = new SavingTable();
    savingTable.setQueryEditorId(UUID.randomUUID().toString());
    savingTable.setAuditId(UUID.randomUUID().toString());
    savingTable.setLoginUserId("polaris");
    savingTable.setWebSocketId("test-socket");
    savingTable.setTableName("abc_123");

    QueryResultRepository mockQueryResultRepository = mock(QueryResultRepository.class);
    QueryResultMetaData queryResultMetaData = new QueryResultMetaData(Arrays.asList("year", "temperature", "quality"),
        String.format("/tmp/metatron/%s/%s/%s.dat", savingTable.getLoginUserId(), savingTable.getQueryEditorId(), savingTable.getAuditId()));
    stub(mockQueryResultRepository.findMetaData(hiveConnection,
        savingTable.getLoginUserId(), savingTable.getQueryEditorId(), savingTable.getAuditId())).toReturn(queryResultMetaData);

    // when
    HiveSqlScriptGenerator generator = new HiveSqlScriptGenerator();
    generator.setQueryResultRepository(mockQueryResultRepository);
    String actual = generator.generateSaveAsTable(hiveConnection, savingTable);

    System.out.println(actual);

    // then
    assertThat(actual).contains(
        String.format("CREATE DATABASE IF NOT EXISTS %s_%s;",
            hiveConnection.getPersonalDatabasePrefix(), savingTable.getLoginUserId()));
    assertThat(actual).contains(
        String.format("CREATE TABLE %s_%s.%s (year STRING, temperature STRING, quality STRING) ROW FORMAT DELIMITED FIELDS TERMINATED BY '\\001' LINES TERMINATED BY '\\n';",
            hiveConnection.getPersonalDatabasePrefix(), savingTable.getLoginUserId(), savingTable.getTableName()));
    assertThat(actual).contains(String.format("LOAD DATA INPATH '%s' OVERWRITE INTO TABLE %s_%s.%s;",
        queryResultMetaData.getDataPath(), hiveConnection.getPersonalDatabasePrefix(), savingTable.getLoginUserId(), savingTable.getTableName()));
  }

  @Test
  public void generateSaveAsTable_when_header_contain_dot() {
    // given
    HiveConnection hiveConnection = new HiveConnection();
    hiveConnection.setUsername("read_only");
    hiveConnection.setPassword("1111");
    hiveConnection.setSecondaryUsername("hive_admin");
    hiveConnection.setSecondaryPassword("1111");
    hiveConnection.setHostname("localhost");
    hiveConnection.setPort(10000);
    hiveConnection.setPersonalDatabasePrefix("private");
    hiveConnection.setHdfsConfigurationPath(Paths.get("src/test/hdfs-conf").toAbsolutePath().toString());

    SavingTable savingTable = new SavingTable();
    savingTable.setQueryEditorId(UUID.randomUUID().toString());
    savingTable.setAuditId(UUID.randomUUID().toString());
    savingTable.setLoginUserId("polaris");
    savingTable.setWebSocketId("test-socket");
    savingTable.setTableName("abc_123");

    QueryResultRepository mockQueryResultRepository = mock(QueryResultRepository.class);
    QueryResultMetaData queryResultMetaData = new QueryResultMetaData(Arrays.asList("records.year", "records.temperature", "records.quality"),
        String.format("/tmp/metatron/%s/%s/%s.dat", savingTable.getLoginUserId(), savingTable.getQueryEditorId(), savingTable.getAuditId()));
    stub(mockQueryResultRepository.findMetaData(hiveConnection,
        savingTable.getLoginUserId(), savingTable.getQueryEditorId(), savingTable.getAuditId())).toReturn(queryResultMetaData);

    // when
    HiveSqlScriptGenerator generator = new HiveSqlScriptGenerator();
    generator.setQueryResultRepository(mockQueryResultRepository);
    String actual = generator.generateSaveAsTable(hiveConnection, savingTable);

    // then
    assertThat(actual).contains(
        String.format("CREATE DATABASE IF NOT EXISTS %s_%s;",
            hiveConnection.getPersonalDatabasePrefix(), savingTable.getLoginUserId()));
    assertThat(actual).contains(
        String.format("CREATE TABLE %s_%s.%s (year STRING, temperature STRING, quality STRING) ROW FORMAT DELIMITED FIELDS TERMINATED BY '\\001' LINES TERMINATED BY '\\n';",
            hiveConnection.getPersonalDatabasePrefix(), savingTable.getLoginUserId(), savingTable.getTableName()));
    assertThat(actual).contains(String.format("LOAD DATA INPATH '%s' OVERWRITE INTO TABLE %s_%s.%s;",
        queryResultMetaData.getDataPath(), hiveConnection.getPersonalDatabasePrefix(), savingTable.getLoginUserId(), savingTable.getTableName()));
  }
}