package app.metatron.discovery.domain.workbench;

import app.metatron.discovery.util.excel.ExcelRowMapper;
import com.google.common.collect.Maps;
import org.apache.commons.lang.StringUtils;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;

import java.util.Map;

public class ImportExcelFileRowMapper implements ExcelRowMapper<Map<String, Object>> {
  private final DataFormatter formatter = new DataFormatter();
  private final Map<Integer, String> headers;
  private final boolean firstHeaderRow;

  public ImportExcelFileRowMapper(Map<Integer, String> headers, boolean firstHeaderRow) {
    this.headers = headers;
    this.firstHeaderRow = firstHeaderRow;
  }

  @Override
  public Map<String, Object> mapRow(int rowNumber, Row row) {
    if (rowNumber == 1) {
      if (firstHeaderRow) {
        for (Cell cell : row) {
          headers.put(cell.getColumnIndex(), StringUtils.defaultString(cell.getStringCellValue(), "col_" + (cell.getColumnIndex() + 1)));
        }
        return null;
      } else {
        for (Cell cell : row) {
          headers.put(cell.getColumnIndex(), "col_" + (cell.getColumnIndex() + 1));
        }
      }
    }

    Map<String, Object> rowMap = Maps.newTreeMap();
    for (Cell cell : row) {
      if (headers.containsKey(cell.getColumnIndex())) {
        rowMap.put(headers.get(cell.getColumnIndex()), formatter.formatCellValue(cell));
      }

    }
    return rowMap;
  }
}
