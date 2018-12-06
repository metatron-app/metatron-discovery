package app.metatron.discovery.util.excel;

import org.apache.poi.ss.usermodel.Row;

public interface ExcelRowMapper<T> {
  T mapRow(int rowNumber, Row row);
}
