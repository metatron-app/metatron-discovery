package app.metatron.discovery.domain.dataprep.csv;

import java.util.ArrayList;
import java.util.List;

public class PrepCsvParseResult {
  public List<String[]> grid;
  public List<String> colNames;
  public int maxColCnt;

  public PrepCsvParseResult() {
    grid = new ArrayList();
    colNames = null;
    maxColCnt = -1;
  }
}
