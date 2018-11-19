package app.metatron.discovery.domain.datasource;

/**
 * Project : metatron-discovery
 * Created by IntelliJ IDEA
 * Developer : sohncw
 * Date : 2018. 11. 19.
 * Time : AM 10:48
 */
public class DataSourceListFilter {

  DataSourceListCriterion.CriterionKey criterionKey;
  String filterKey;
  String filterSubKey;
  String filterName;
  String filterValue;
  String filterSubValue;

  public DataSourceListFilter(DataSourceListCriterion.CriterionKey criterionKey, String filterKey, String filterValue, String filterName){
    this.criterionKey = criterionKey;
    this.filterKey = filterKey;
    this.filterValue = filterValue;
    this.filterName = filterName;
  }

  public DataSourceListFilter(DataSourceListCriterion.CriterionKey criterionKey, String filterKey, String filterSubKey,
                              String filterValue, String filterSubValue, String filterName){
    this.criterionKey = criterionKey;
    this.filterKey = filterKey;
    this.filterSubKey = filterSubKey;
    this.filterValue = filterValue;
    this.filterSubValue = filterSubValue;
    this.filterName = filterName;
  }

  public DataSourceListFilter(String filterKey, String filterValue, String filterName){
    this.filterKey = filterKey;
    this.filterValue = filterValue;
    this.filterName = filterName;
  }

  public DataSourceListCriterion.CriterionKey getCriterionKey() {
    return criterionKey;
  }

  public void setCriterionKey(DataSourceListCriterion.CriterionKey criterionKey) {
    this.criterionKey = criterionKey;
  }

  public String getFilterKey() {
    return filterKey;
  }

  public void setFilterKey(String filterKey) {
    this.filterKey = filterKey;
  }

  public String getFilterSubKey() {
    return filterSubKey;
  }

  public void setFilterSubKey(String filterSubKey) {
    this.filterSubKey = filterSubKey;
  }

  public String getFilterName() {
    return filterName;
  }

  public void setFilterName(String filterName) {
    this.filterName = filterName;
  }

  public String getFilterValue() {
    return filterValue;
  }

  public void setFilterValue(String filterValue) {
    this.filterValue = filterValue;
  }

  public String getFilterSubValue() {
    return filterSubValue;
  }

  public void setFilterSubValue(String filterSubValue) {
    this.filterSubValue = filterSubValue;
  }
}
