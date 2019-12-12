package app.metatron.discovery.plugins.hive_personal_database;

import app.metatron.discovery.plugins.hive_personal_database.dto.CreateColumnInformation;
import app.metatron.discovery.plugins.hive_personal_database.dto.CreateTableInformation;
import org.junit.Test;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.*;

public class ScriptGeneratorTest {

  @Test
  public void generateCreateTable() {
    // given
    CreateTableInformation createTableInfo = new CreateTableInformation();
    createTableInfo.setDatabase("test-db");
    createTableInfo.setTable("test-table");
    createTableInfo.setColumns(Arrays.asList(
        new CreateColumnInformation("general", "col_1", "string"),
        new CreateColumnInformation("general", "col_2", "string")));

    // when
    ScriptGenerator generator = new ScriptGenerator();
    String createTableScript = generator.generateCreateTable(createTableInfo);

    // then
    System.out.println(createTableScript);
    List<String> sqlList = Arrays.asList(createTableScript.split(";"));
    assertThat(sqlList).hasSize(2);
    assertThat(sqlList.get(0)).isEqualToIgnoringCase(String.format("CREATE DATABASE IF NOT EXISTS %s", createTableInfo.getDatabase()));

    String expectColumns = createTableInfo.getColumns().stream().map(column -> String.format("`%s` %s", column.getColumnName(), column.getColumnDataType())).collect(Collectors.joining(","));
    assertThat(sqlList.get(1)).isEqualToIgnoringCase(String.format("CREATE TABLE %s.%s (%s)",
        createTableInfo.getDatabase(), createTableInfo.getTable(), expectColumns));
  }

  @Test
  public void generateCreateTable_with_partition_column() {
    // given
    CreateTableInformation createTableInfo = new CreateTableInformation();
    createTableInfo.setDatabase("test-db");
    createTableInfo.setTable("test-table");
    createTableInfo.setColumns(Arrays.asList(
        new CreateColumnInformation("general", "col_1", "string"),
        new CreateColumnInformation("general", "col_2", "string"),
        new CreateColumnInformation("partition", "dt", "string"),
        new CreateColumnInformation("partition", "hh", "string")));

    // when
    ScriptGenerator generator = new ScriptGenerator();
    String createTableScript = generator.generateCreateTable(createTableInfo);

    // then
    System.out.println(createTableScript);
    List<String> sqlList = Arrays.asList(createTableScript.split(";"));
    assertThat(sqlList).hasSize(2);
    assertThat(sqlList.get(0)).isEqualToIgnoringCase(String.format("CREATE DATABASE IF NOT EXISTS %s", createTableInfo.getDatabase()));

    String expectColumns = createTableInfo.getColumns().stream()
        .filter(column -> column.getColumnType().equalsIgnoreCase("general"))
        .map(column -> String.format("`%s` %s", column.getColumnName(), column.getColumnDataType())).collect(Collectors.joining(","));

    String expectPartitionColumns = createTableInfo.getColumns().stream()
        .filter(column -> column.getColumnType().equalsIgnoreCase("partition"))
        .map(column -> String.format("`%s` %s", column.getColumnName(), column.getColumnDataType())).collect(Collectors.joining(","));

    assertThat(sqlList.get(1)).isEqualToIgnoringCase(String.format("CREATE TABLE %s.%s (%s) PARTITIONED BY(%s)",
        createTableInfo.getDatabase(), createTableInfo.getTable(), expectColumns, expectPartitionColumns));
  }
}