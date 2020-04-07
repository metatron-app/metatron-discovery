package app.metatron.discovery.domain.idcube.hive_personal_database.file;

import app.metatron.discovery.util.csv.CsvRowMapper;
import com.google.common.collect.Maps;

import java.util.Map;

public class ImportCsvFileRowMapper implements CsvRowMapper<Map<String, Object>> {
  private final Map<Integer, String> headers;
  private final boolean firstHeaderRow;

  public ImportCsvFileRowMapper(Map<Integer, String> headers, boolean firstHeaderRow) {
    this.headers = headers;
    this.firstHeaderRow = firstHeaderRow;
  }

  @Override
  public Map<String, Object> mapRow(int rowNumber, String[] row) {
    if(rowNumber == 1) {
      if(firstHeaderRow) {
        for (int i = 0; i < row.length; i++) {
          headers.put(i, row[i]);
        }
        return null;
      } else {
        for (int i = 0; i < row.length; i++) {
          headers.put(i, "col_" + (i + 1));
        }
      }
    }
    Map<String, Object> rowMap = Maps.newTreeMap();
    for (int i = 0; i < row.length; i++) {
      if (headers.containsKey(i)) {
        rowMap.put(headers.get(i), row[i]);
      }
    }
    return rowMap;
  }
}
