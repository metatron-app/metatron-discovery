package app.metatron.discovery.domain.workbook.configurations.format;

import com.google.common.collect.Maps;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Map;

public class GeoBoundaryFormat extends GeoFormat implements FieldFormat {

  String dataSource;

  String geoColumn;

  String descColumn;

  @JsonCreator
  public GeoBoundaryFormat(@JsonProperty("dataSource") String dataSource,
                           @JsonProperty("geoColumn") String geoColumn,
                           @JsonProperty("descColumn") String descColumn) {
    this.dataSource = dataSource;
    this.geoColumn = geoColumn;
    this.descColumn = descColumn;
  }

  public String toBoundary() {
    return dataSource + "." + geoColumn;
  }

  /**
   *
   * @param mapper
   * @param geoCnt
   * @param dimCnt
   * @return
   */
  public Map<String, Object> toBoundaryJoin(Map<String, String> mapper, int geoCnt, int dimCnt) {
    Map<String, Object> joinMap = Maps.newLinkedHashMap();
    String dimName = "__s" + dimCnt;

    joinMap.put("__g" + geoCnt, geoColumn);
    joinMap.put(dimName, descColumn);

    mapper.put(dimName, descColumn);

    return joinMap;
  }

  public String getDataSource() {
    return dataSource;
  }

  public void setDataSource(String dataSource) {
    this.dataSource = dataSource;
  }

  public String getGeoColumn() {
    return geoColumn;
  }

  public void setGeoColumn(String geoColumn) {
    this.geoColumn = geoColumn;
  }

  public String getDescColumn() {
    return descColumn;
  }

  public void setDescColumn(String descColumn) {
    this.descColumn = descColumn;
  }
}
