package app.metatron.discovery.domain.idcube.hive_personal_database.script;

import app.metatron.discovery.domain.idcube.hive_personal_database.dto.CreateTableInformation;
import org.apache.commons.lang.StringUtils;

import java.util.stream.Collectors;

public class ScriptGenerator {

  public String generateCreateTable(final CreateTableInformation tableInformation) {
    StringBuffer script = new StringBuffer();
    script.append(String.format("CREATE DATABASE IF NOT EXISTS %s;", tableInformation.getDatabase()));

    String generalColumns = tableInformation.getColumns().stream()
        .filter(col -> col.getColumnType().equalsIgnoreCase("general"))
        .map(column -> String.format("`%s` %s", column.getColumnName(), column.getColumnDataType()))
        .collect(Collectors.joining(","));

    String partitionColumns = tableInformation.getColumns().stream()
        .filter(col -> col.getColumnType().equalsIgnoreCase("partition"))
        .map(column -> String.format("`%s` %s", column.getColumnName(), column.getColumnDataType()))
        .collect(Collectors.joining(","));

    if(StringUtils.isEmpty(partitionColumns)) {
      script.append(String.format("CREATE TABLE %s.%s (%s);",
          tableInformation.getDatabase(),
          tableInformation.getTable(),
          generalColumns
      ));
    } else {
      script.append(String.format("CREATE TABLE %s.%s (%s) PARTITIONED BY(%s);",
          tableInformation.getDatabase(),
          tableInformation.getTable(),
          generalColumns,
          partitionColumns
      ));
    }
    return script.toString();
  }
}
