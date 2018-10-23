package app.metatron.discovery.util.excel;

import java.util.List;

public class ExcelSheet<C, R>  {
  private C headers;
  private List<R> rows;

  public ExcelSheet(C headers, List<R> rows) {
    this.headers = headers;
    this.rows = rows;
  }

  public C getHeaders() {
    return headers;
  }

  public List<R> getRows() {
    return rows;
  }
}
