package app.metatron.discovery.domain.datasource;

import java.util.ArrayList;
import java.util.List;

/**
 * Project : metatron-discovery
 * Created by IntelliJ IDEA
 * Developer : sohncw
 * Date : 2018. 11. 19.
 * Time : AM 10:48
 */
public class DataSourceListCriterion {

  CriterionKey criterionKey;
  CriterionType criterionType;
  String criterionName;
  List<DataSourceListCriterion> subCriteria;
  List<DataSourceListFilter> filters;

  public DataSourceListCriterion(){
  }

  public DataSourceListCriterion(CriterionKey criterionKey, CriterionType criterionType, String criterionName){
    this.criterionKey = criterionKey;
    this.criterionType = criterionType;
    this.criterionName = criterionName;
  }

  public void addFilter(DataSourceListFilter dataSourceFilter){
    if(filters == null){
      filters = new ArrayList<>();
    }
    filters.add(dataSourceFilter);
  }

  public void addSubCriterion(DataSourceListCriterion subCriterion){
    if(subCriteria == null){
      subCriteria = new ArrayList<>();
    }
    subCriteria.add(subCriterion);
  }

  public CriterionKey getCriterionKey() {
    return criterionKey;
  }

  public void setCriterionKey(CriterionKey criterionKey) {
    this.criterionKey = criterionKey;
  }

  public CriterionType getCriterionType() {
    return criterionType;
  }

  public void setCriterionType(CriterionType criterionType) {
    this.criterionType = criterionType;
  }

  public String getCriterionName() {
    return criterionName;
  }

  public void setCriterionName(String criterionName) {
    this.criterionName = criterionName;
  }

  public List<DataSourceListCriterion> getSubCriteria() {
    return subCriteria;
  }

  public void setSubCriteria(List<DataSourceListCriterion> subCriteria) {
    this.subCriteria = subCriteria;
  }

  public List<DataSourceListFilter> getFilters() {
    return filters;
  }

  public void setFilters(List<DataSourceListFilter> filters) {
    this.filters = filters;
  }

  enum CriterionKey{
    STATUS, PUBLISH, CREATOR, DATETIME, CONNECTION_TYPE, DATASOURCE_TYPE, SOURCE_TYPE, MORE, CONTAINS_TEXT, CREATED_TIME, MODIFIED_TIME
  }

  enum CriterionType{
    CHECKBOX, RADIO, DATETIME, RANGE_DATETIME, TEXT
  }
}
