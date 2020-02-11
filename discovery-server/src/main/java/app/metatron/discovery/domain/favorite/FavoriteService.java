/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.favorite;

import com.google.common.collect.Lists;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

import app.metatron.discovery.common.entity.DomainType;
import app.metatron.discovery.util.AuthUtils;

@Component
public class FavoriteService {

  private static final Logger LOGGER = LoggerFactory.getLogger(FavoriteService.class);

  @Autowired
  FavoriteRepository favoriteRepository;

  @Transactional
  public void addFavorite(DomainType domainType, String targetId){
    String username = AuthUtils.getAuthUserName();
    List<Favorite> favoriteList = favoriteRepository.findByCreatedByAndDomainTypeAndTargetIdIn(username, domainType, Lists.newArrayList(targetId));
    if(favoriteList == null || favoriteList.isEmpty()){
      Favorite favorite = new Favorite();
      favorite.setDomainType(domainType);
      favorite.setTargetId(targetId);
      favoriteRepository.save(favorite);
    }
  }

  @Transactional
  public void removeFavorite(DomainType domainType, String targetId){
    String username = AuthUtils.getAuthUserName();
    List<Favorite> favoriteList = favoriteRepository.findByCreatedByAndDomainTypeAndTargetIdIn(username, domainType, Lists.newArrayList(targetId));
    if(favoriteList != null && !favoriteList.isEmpty()){
      favoriteRepository.delete(favoriteList);
    }
  }

  public List<String> getFavoriteDomainIdList(List<String> domainIdList, DomainType domainType){
    List<String> favoriteDomainIdList = null;
    if(domainIdList != null && !domainIdList.isEmpty()){
      String userName = AuthUtils.getAuthUserName();
      List<Favorite> favoriteList = favoriteRepository.findByCreatedByAndDomainTypeAndTargetIdIn(userName, domainType, domainIdList);
      if(favoriteList != null && !favoriteList.isEmpty()){
        favoriteDomainIdList = favoriteList.stream().map(favorite -> favorite.getTargetId()).collect(Collectors.toList());
      }
    }
    return favoriteDomainIdList;
  }

  public boolean isFavorite(String targetId, DomainType domainType){
    String userName = AuthUtils.getAuthUserName();
    List<Favorite> favoriteList
        = favoriteRepository.findByCreatedByAndDomainTypeAndTargetIdIn(userName, domainType, Lists.newArrayList(targetId));
    return (favoriteList != null && favoriteList.size() > 0);
  }
}
