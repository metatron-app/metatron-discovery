package app.metatron.discovery.domain.workbench;

import java.util.ArrayList;
import java.util.List;

public class QueryResultMetaData {
  private List<String> headers = new ArrayList<>();
  private String dataPath;

  public QueryResultMetaData(List<String> headers, String dataPath) {
    this.headers = headers;
    this.dataPath = dataPath;
  }

  public List<String> getHeaders() {
    return headers;
  }

  public String getDataPath() {
    return dataPath;
  }
}
