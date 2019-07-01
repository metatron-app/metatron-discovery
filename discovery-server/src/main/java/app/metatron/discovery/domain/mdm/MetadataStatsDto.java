package app.metatron.discovery.domain.mdm;

/**
 *
 */
public class MetadataStatsDto {
  String keyword;
  Long value;

  public MetadataStatsDto(){

  }

  public MetadataStatsDto(Object keyword, Long value){
    this.keyword = keyword == null ? "" : keyword.toString();
    this.value = value;
  }

  public String getKeyword() {
    return keyword;
  }

  public void setKeyword(String keyword) {
    this.keyword = keyword;
  }

  public Long getValue() {
    return value;
  }

  public void setValue(Long value) {
    this.value = value;
  }
}
