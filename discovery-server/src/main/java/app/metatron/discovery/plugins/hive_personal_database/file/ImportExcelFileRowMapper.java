package app.metatron.discovery.plugins.hive_personal_database.file;

import app.metatron.discovery.plugins.hive_personal_database.file.excel.ExcelRowMapper;
import com.google.common.collect.Maps;
import org.apache.commons.lang.StringUtils;
import org.apache.poi.ss.usermodel.*;

import java.util.Map;

public class ImportExcelFileRowMapper implements ExcelRowMapper<Map<String, Object>> {
  private final DataFormatter formatter = new DataFormatter();
  private final Map<Integer, String> headers;
  private final boolean firstHeaderRow;
  private final FormulaEvaluator formulaEvaluator;

  public ImportExcelFileRowMapper(Map<Integer, String> headers, boolean firstHeaderRow, FormulaEvaluator formulaEvaluator) {
    this.headers = headers;
    this.firstHeaderRow = firstHeaderRow;
    this.formulaEvaluator = formulaEvaluator;
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
        rowMap.put(headers.get(cell.getColumnIndex()), getFormatCellValue(cell));
      }

    }
    return rowMap;
  }

  private String getFormatCellValue(Cell cell) {
    if(cell.getCellTypeEnum() == CellType.FORMULA) {
      if(formulaEvaluator != null) {
        return formatter.formatCellValue(cell, formulaEvaluator);
      } else {
        return formatter.formatCellValue(cell);
      }
    } else {
      return formatter.formatCellValue(cell).replaceAll("[\n\r]", " ");
    }
  }
}
