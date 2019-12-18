package app.metatron.discovery.plugins.hive_personal_database.file.excel;

import org.apache.poi.ss.usermodel.Row;

public interface ExcelFirstRowMapper<T> {
  T mapRow(Row firstRow);
}
