package app.metatron.discovery.domain.datasource;

import app.metatron.discovery.common.criteria.ListCriterionKey;

/**
 * Project : metatron-discovery
 * Created by IntelliJ IDEA
 * Developer : sohncw
 * Date : 2018. 11. 27.
 * Time : PM 3:15
 */
public enum DataSourceListCriterionKey implements ListCriterionKey {
  STATUS("STATUS"),
  PUBLISH("PUBLISH"),
  CREATOR("CREATOR"),
  DATETIME("DATETIME"),
  CONNECTION_TYPE("CONNECTION_TYPE"),
  DATASOURCE_TYPE("DATASOURCE_TYPE"),
  SOURCE_TYPE("SOURCE_TYPE"),
  MORE("MORE"),
  CONTAINS_TEXT("CONTAINS_TEXT"),
  CREATED_TIME("CREATE_TIME"),
  MODIFIED_TIME("MODIFIED_TIME");

  String criterionKey;
  DataSourceListCriterionKey(String s){
    criterionKey = s;
  }

  public DataSourceListCriterionKey getCriterionKey(){
    return DataSourceListCriterionKey.valueOf(criterionKey);
  }
}
