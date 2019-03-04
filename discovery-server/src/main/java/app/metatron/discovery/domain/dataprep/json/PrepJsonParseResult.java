package app.metatron.discovery.domain.dataprep.json;

import java.util.ArrayList;
import java.util.List;

public class PrepJsonParseResult {
  public List<String[]> grid;
  public List<String> colNames;
  public int maxColCnt;

  // Used only in PrepJsonUtil.parse() when onlyCount is true
  public long totalRows;
  public long totalBytes;

  public PrepJsonParseResult() {
    grid = new ArrayList();
    colNames = null;
    maxColCnt = -1;
  }
}
