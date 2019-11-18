package app.metatron.discovery.domain.dataprep.file;

import java.util.ArrayList;
import java.util.List;

public class PrepParseResult {

  public List<String[]> grid;
  public List<String> colNames;

  // Used only in PrepCsvUtil.parse() when onlyCount is true
  public long totalRows;
  public long totalBytes;

  public PrepParseResult() {
    grid = new ArrayList();
    totalRows = 0L;
    totalBytes = 0L;
  }
}
