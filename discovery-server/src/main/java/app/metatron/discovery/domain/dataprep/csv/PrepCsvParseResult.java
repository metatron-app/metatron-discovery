package app.metatron.discovery.domain.dataprep.csv;

import java.util.ArrayList;
import java.util.List;

public class PrepCsvParseResult {
  List<String[]> grid;
  List<String> colNames;
  int maxColCnt;

  public PrepCsvParseResult() {
    grid = new ArrayList();
    colNames = null;
    maxColCnt = 0;
  }
}
