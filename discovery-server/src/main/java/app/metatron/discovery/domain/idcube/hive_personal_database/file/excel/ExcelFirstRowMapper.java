package app.metatron.discovery.domain.idcube.hive_personal_database.file.excel;

import org.apache.poi.ss.usermodel.Row;

public interface ExcelFirstRowMapper<T> {
  T mapRow(Row firstRow);
}
