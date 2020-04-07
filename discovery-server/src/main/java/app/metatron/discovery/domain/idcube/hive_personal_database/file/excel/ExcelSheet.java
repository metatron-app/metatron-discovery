package app.metatron.discovery.domain.idcube.hive_personal_database.file.excel;

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
