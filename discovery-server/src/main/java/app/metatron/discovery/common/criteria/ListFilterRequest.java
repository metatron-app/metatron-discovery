package app.metatron.discovery.common.criteria;

import app.metatron.discovery.common.entity.SearchParamValidator;
import org.joda.time.DateTime;

import java.util.ArrayList;
import java.util.List;

/**
 * Project : metatron-discovery
 * Created by IntelliJ IDEA
 * Developer : sohncw
 * Date : 2018. 11. 29.
 * Time : PM 7:25
 */
public abstract class ListFilterRequest {
  List<String> createdBy;
  List<String> modifiedBy;
  DateTime createdTimeFrom;
  DateTime createdTimeTo;
  DateTime modifiedTimeFrom;
  DateTime modifiedTimeTo;
  String containsText;

  public List<String> getCreatedBy() {
    return createdBy;
  }

  public void setCreatedBy(List<String> createdBy) {
    this.createdBy = createdBy;
  }

  public List<String> getModifiedBy() {
    return modifiedBy;
  }

  public void setModifiedBy(List<String> modifiedBy) {
    this.modifiedBy = modifiedBy;
  }

  public DateTime getCreatedTimeFrom() {
    return createdTimeFrom;
  }

  public void setCreatedTimeFrom(DateTime createdTimeFrom) {
    this.createdTimeFrom = createdTimeFrom;
  }

  public DateTime getCreatedTimeTo() {
    return createdTimeTo;
  }

  public void setCreatedTimeTo(DateTime createdTimeTo) {
    this.createdTimeTo = createdTimeTo;
  }

  public DateTime getModifiedTimeFrom() {
    return modifiedTimeFrom;
  }

  public void setModifiedTimeFrom(DateTime modifiedTimeFrom) {
    this.modifiedTimeFrom = modifiedTimeFrom;
  }

  public DateTime getModifiedTimeTo() {
    return modifiedTimeTo;
  }

  public void setModifiedTimeTo(DateTime modifiedTimeTo) {
    this.modifiedTimeTo = modifiedTimeTo;
  }

  public String getContainsText() {
    return containsText;
  }

  public void setContainsText(String containsText) {
    this.containsText = containsText;
  }

  public <E extends Enum<E>> List<E> getEnumList(List<String> enumStrList, Class<E> enumClass, String propName){
    List<E> enumList = null;
    if(enumStrList != null && !enumStrList.isEmpty()){
      enumList = new ArrayList<>();
      for(String enumStr : enumStrList){
        enumList.add(SearchParamValidator.enumUpperValue(enumClass, enumStr, propName));
      }
    }
    return enumList;
  }
}
