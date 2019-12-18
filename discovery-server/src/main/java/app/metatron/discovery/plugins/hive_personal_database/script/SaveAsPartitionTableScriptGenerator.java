package app.metatron.discovery.plugins.hive_personal_database.script;


import app.metatron.discovery.plugins.hive_personal_database.dto.SavingHiveTable;

import java.util.UUID;
import java.util.stream.Collectors;

public class SaveAsPartitionTableScriptGenerator extends AbstractSaveAsTableScriptGenerator {
  private final String TMP_TABLE_NAME;

  public SaveAsPartitionTableScriptGenerator(SavingHiveTable savingHiveTable) {
    super(savingHiveTable);
    this.TMP_TABLE_NAME = UUID.randomUUID().toString().replace("-", "_") + "_import_file_tmp";
  }

  @Override
  protected String getTableName() {
    return TMP_TABLE_NAME;
  }

  @Override
  protected String additionalScript() {
    StringBuffer script = new StringBuffer();

    // Create Partition Table
    String partitionTableColumns = savingHiveTable.getDataTable().getFields().stream()
        .filter(col -> col.contains(savingHiveTable.getTablePartitionColumn()) == false)
        .map(header -> {
          if(header.contains(".")) {
            return String.format("`%s`", header.substring(header.indexOf(".") + 1, header.length()));
          } else {
            return String.format("`%s`", header);
          }
        }).collect(Collectors.joining(" STRING, ", "", " STRING"));

    if(savingHiveTable.isTableOverwrite()) {
      script.append(String.format("CREATE TABLE IF NOT EXISTS %s.%s (%s) PARTITIONED BY(%s STRING);",
          savingHiveTable.getDatabaseName(), savingHiveTable.getTableName(), partitionTableColumns, savingHiveTable.getTablePartitionColumn()));
    } else {
      script.append(String.format("CREATE TABLE %s.%s (%s) PARTITIONED BY(%s STRING);",
          savingHiveTable.getDatabaseName(), savingHiveTable.getTableName(), partitionTableColumns, savingHiveTable.getTablePartitionColumn()));
    }

    // Load Data to Partition Table
    script.append("set hive.exec.dynamic.partition.mode=nonstrict;");
    String partitionTableInsertColumns = savingHiveTable.getDataTable().getFields().stream()
        .filter(col -> col.contains(savingHiveTable.getTablePartitionColumn()) == false)
        .collect(Collectors.joining(", "));

    script.append(String.format("INSERT OVERWRITE TABLE %s.%s PARTITION(%s) SELECT %s, %s FROM %s.%s;",
        savingHiveTable.getDatabaseName(), savingHiveTable.getTableName(), savingHiveTable.getTablePartitionColumn(),
        partitionTableInsertColumns, savingHiveTable.getTablePartitionColumn(), savingHiveTable.getDatabaseName(), TMP_TABLE_NAME));

    // Drop Temp Table
    script.append(String.format("DROP TABLE %s.%s;", savingHiveTable.getDatabaseName(), TMP_TABLE_NAME));

    return script.toString();
  }

  @Override
  public String rollbackScript() {
    StringBuffer rollbackScript = new StringBuffer();
    rollbackScript.append(String.format("DROP TABLE %s.%s;", savingHiveTable.getDatabaseName(), TMP_TABLE_NAME));

    return rollbackScript.toString();
  }
}
