package app.metatron.discovery.util.excel;

import org.apache.poi.ss.usermodel.Row;

import java.sql.SQLException;
import java.util.Map;

public interface ExcelFirstRowMapper<T> {
  T mapRow(Row firstRow);
}
