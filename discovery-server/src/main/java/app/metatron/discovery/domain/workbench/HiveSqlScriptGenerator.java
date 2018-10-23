package app.metatron.discovery.domain.workbench;

import app.metatron.discovery.domain.datasource.connection.jdbc.HiveConnection;
import app.metatron.discovery.domain.datasource.connection.jdbc.JdbcDataConnection;
import app.metatron.discovery.domain.workbench.dto.SavingTable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class HiveSqlScriptGenerator {

  private static Logger LOGGER = LoggerFactory.getLogger(HiveSqlScriptGenerator.class);

  private QueryResultRepository queryResultRepository;

  @Autowired
  public void setQueryResultRepository(QueryResultRepository queryResultRepository) {
    this.queryResultRepository = queryResultRepository;
  }

  public String generateSaveAsTable(JdbcDataConnection jdbcDataConnection, SavingTable savingTable) {
    StringBuffer script = new StringBuffer();
    // 1. Create Database
    final String personalDatabaseName = String.format("%s_%s", ((HiveConnection)jdbcDataConnection).getPersonalDatabasePrefix(), savingTable.getLoginUserId());
    script.append(String.format("CREATE DATABASE IF NOT EXISTS %s;", personalDatabaseName));

    // 2. Create Table
    QueryResultMetaData queryResultMetaData = queryResultRepository.findMetaData(jdbcDataConnection, savingTable.getLoginUserId(), savingTable.getQueryEditorId(), savingTable.getAuditId());

    List<String> headers = queryResultMetaData.getHeaders();
    String queryResultDataPath = queryResultMetaData.getDataPath();

    String columns = headers.stream().map(header -> {
      if(header.contains(".")) {
        return header.substring(header.indexOf(".") + 1, header.length());
      } else {
        return header;
      }
    }).collect(Collectors.joining(" STRING, ", "", " STRING"));
    script.append(String.format("CREATE TABLE %s.%s (%s) ROW FORMAT DELIMITED FIELDS TERMINATED BY '\\001' LINES TERMINATED BY '\\n';",
        personalDatabaseName, savingTable.getTableName(), columns));

    // 3. Load Data to Table
    script.append(String.format("LOAD DATA INPATH '%s' OVERWRITE INTO TABLE %s.%s;", queryResultDataPath, personalDatabaseName, savingTable.getTableName()));

    LOGGER.info("Save as Hive Table Query : " + script.toString());
    return script.toString();
  }
}
