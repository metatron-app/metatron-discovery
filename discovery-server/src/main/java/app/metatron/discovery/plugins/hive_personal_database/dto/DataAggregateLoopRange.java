package app.metatron.discovery.plugins.hive_personal_database.dto;

public class DataAggregateLoopRange {
  private String type;
  private String from;
  private String to;
  private String format;

  public DataAggregateLoopRange() {
  }

  public DataAggregateLoopRange(String type, String from, String to, String format) {
    this.type = type;
    this.from = from;
    this.to = to;
    this.format = format;
  }

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public String getFrom() {
    return from;
  }

  public void setFrom(String from) {
    this.from = from;
  }

  public String getTo() {
    return to;
  }

  public void setTo(String to) {
    this.to = to;
  }

  public String getFormat() {
    return format;
  }

  public void setFormat(String format) {
    this.format = format;
  }

  @Override
  public String toString() {
    return "DataAggregateLoopRange{" +
        "type='" + type + '\'' +
        ", from='" + from + '\'' +
        ", to='" + to + '\'' +
        ", format='" + format + '\'' +
        '}';
  }

  public void validate() {
    // TODO Loop range 날짜. 시간 범위 검증.. 포멧 검증
  }
}
