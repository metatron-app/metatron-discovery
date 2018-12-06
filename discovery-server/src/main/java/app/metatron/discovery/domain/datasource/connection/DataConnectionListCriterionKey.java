package app.metatron.discovery.domain.datasource.connection;

import app.metatron.discovery.common.criteria.ListCriterionKey;

/**
 * Project : metatron-discovery
 * Created by IntelliJ IDEA
 * Developer : sohncw
 * Date : 2018. 11. 27.
 * Time : PM 3:15
 */
public enum DataConnectionListCriterionKey implements ListCriterionKey {
  MORE("MORE"),
  CREATOR("CREATOR"),
  CREATED_TIME("CREATE_TIME"),
  IMPLEMENTOR("IMPLEMENTOR"),
  AUTH_TYPE("AUTH_TYPE"),
  PUBLISH("PUBLISH"),
  MODIFIED_TIME("MODIFIED_TIME");

  String criterionKey;
  DataConnectionListCriterionKey(String s){
    criterionKey = s;
  }

  public DataConnectionListCriterionKey getCriterionKey(){
    return DataConnectionListCriterionKey.valueOf(criterionKey);
  }

}
