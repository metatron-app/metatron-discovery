package app.metatron.discovery.domain.dataprep.csv;

import java.util.ArrayList;
import java.util.List;

public class PrepCsvParseResult {
  public List<String[]> grid;
  public List<String> colNames;
  public int maxColCnt;

  // Used only in PrepCsvUtil.parse() when onlyCount is true
  public long totalRows;
  public long totalBytes;

  public PrepCsvParseResult() {
    grid = new ArrayList();
    colNames = null;
    maxColCnt = -1;
    totalRows = 0L;
    totalBytes = 0L;
  }
}
