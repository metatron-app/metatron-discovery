package app.metatron.discovery.plugins.hive_personal_database.script;

import app.metatron.discovery.plugins.hive_personal_database.dto.SavingHiveTable;

import java.util.List;
import java.util.stream.Collectors;

public abstract class AbstractSaveAsTableScriptGenerator {
  private StringBuffer script = new StringBuffer();
  protected SavingHiveTable savingHiveTable;

  public AbstractSaveAsTableScriptGenerator(SavingHiveTable savingHiveTable) {
    this.savingHiveTable = savingHiveTable;
  }

  public String generate() {
    // 1. 데이터베이스 생성
    script.append(String.format("CREATE DATABASE IF NOT EXISTS %s;", savingHiveTable.getDatabaseName()));

    // 2. 테이블 생성
    List<String> fields = savingHiveTable.getDataTable().getFields();
    String storedDataFilePath = savingHiveTable.getHdfsDataFilePath();

    String columns = fields.stream().map(header -> {
      if(header.contains(".")) {
        return String.format("`%s`", header.substring(header.indexOf(".") + 1, header.length()));
      } else {
        return String.format("`%s`", header);
      }
    }).collect(Collectors.joining(" STRING, ", "", " STRING"));

    if(savingHiveTable.isTableOverwrite()) {
      script.append(String.format("CREATE TABLE IF NOT EXISTS %s.%s (%s) ROW FORMAT DELIMITED FIELDS TERMINATED BY '\\001' LINES TERMINATED BY '\\n';",
          savingHiveTable.getDatabaseName(), getTableName(), columns));
    } else {
      script.append(String.format("CREATE TABLE %s.%s (%s) ROW FORMAT DELIMITED FIELDS TERMINATED BY '\\001' LINES TERMINATED BY '\\n';",
          savingHiveTable.getDatabaseName(), getTableName(), columns));
    }

    // 3. Load Data
    script.append(String.format("LOAD DATA INPATH '%s' OVERWRITE INTO TABLE %s.%s;", storedDataFilePath, savingHiveTable.getDatabaseName(), getTableName()));

    // 4. AdditionalScript
    script.append(additionalScript());

    return script.toString();
  }

  protected abstract String getTableName();
  protected abstract String additionalScript();
  public abstract String rollbackScript();
}
