package app.metatron.discovery.common.criteria;

/**
 * Project : metatron-discovery
 * Created by IntelliJ IDEA
 * Developer : sohncw
 * Date : 2018. 11. 27.
 * Time : PM 3:11
 */
public class ListFilter {
  ListCriterionKey criterionKey;
  String filterKey;
  String filterSubKey;
  String filterName;
  String filterValue;
  String filterSubValue;

  public ListFilter(ListCriterionKey criterionKey, String filterKey, String filterValue, String filterName){
    this.criterionKey = criterionKey;
    this.filterKey = filterKey;
    this.filterValue = filterValue;
    this.filterName = filterName;
  }

  public ListFilter(ListCriterionKey criterionKey, String filterKey, String filterSubKey,
                              String filterValue, String filterSubValue, String filterName){
    this.criterionKey = criterionKey;
    this.filterKey = filterKey;
    this.filterSubKey = filterSubKey;
    this.filterValue = filterValue;
    this.filterSubValue = filterSubValue;
    this.filterName = filterName;
  }

  public ListFilter(String filterKey, String filterValue, String filterName){
    this.filterKey = filterKey;
    this.filterValue = filterValue;
    this.filterName = filterName;
  }

  public ListCriterionKey getCriterionKey() {
    return criterionKey;
  }

  public void setCriterionKey(ListCriterionKey criterionKey) {
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
