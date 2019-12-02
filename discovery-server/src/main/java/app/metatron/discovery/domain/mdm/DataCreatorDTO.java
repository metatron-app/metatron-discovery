package app.metatron.discovery.domain.mdm;

import java.util.List;

import app.metatron.discovery.common.BaseProjections;

/**
 *
 */
public class DataCreatorDTO {
  String username;
  BaseProjections.BaseProjectionCls creator;
  Long count;
  Boolean favorite;
  List dataList;
  List followerList;

  public DataCreatorDTO() {
  }

  public DataCreatorDTO(String username, Long count) {
    this.username = username;
    this.count = count;
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public BaseProjections.BaseProjectionCls getCreator() {
    return creator;
  }

  public void setCreator(BaseProjections.BaseProjectionCls creator) {
    this.creator = creator;
  }

  public Long getCount() {
    return count;
  }

  public void setCount(Long count) {
    this.count = count;
  }

  public Boolean getFavorite() {
    return favorite;
  }

  public void setFavorite(Boolean favorite) {
    this.favorite = favorite;
  }

  public List getDataList() {
    return dataList;
  }

  public void setDataList(List dataList) {
    this.dataList = dataList;
  }

  public List getFollowerList() {
    return followerList;
  }

  public void setFollowerList(List followerList) {
    this.followerList = followerList;
  }
}
