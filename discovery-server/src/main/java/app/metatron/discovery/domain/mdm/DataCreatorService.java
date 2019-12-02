/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.mdm;

import org.apache.commons.lang3.BooleanUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import app.metatron.discovery.common.BaseProjections;
import app.metatron.discovery.common.entity.DomainType;
import app.metatron.discovery.domain.favorite.Favorite;
import app.metatron.discovery.domain.favorite.FavoriteRepository;
import app.metatron.discovery.domain.favorite.FavoriteService;
import app.metatron.discovery.domain.user.UserProjections;
import app.metatron.discovery.domain.user.UserRepository;


@Component("dataCreatorService")
@Transactional
public class DataCreatorService {

  private static Logger LOGGER = LoggerFactory.getLogger(DataCreatorService.class);

  @Autowired
  MetadataRepository metadataRepository;

  @Autowired
  FavoriteRepository favoriteRepository;

  @Autowired
  FavoriteService favoriteService;

  @Autowired
  UserRepository userRepository;

  public boolean isFavoriteCreator(String creatorUsername){
    return favoriteService.isFavorite(creatorUsername, DomainType.METADATA_CREATOR);
  }

  public List<DataCreatorDTO> getDataCreatorList(String nameContains){
    //1. getting data creator list
    List<DataCreatorDTO> creatorList = metadataRepository.findDistinctCreatorByName(nameContains);
    System.out.println("creatorList = " + creatorList);

    if(creatorList != null && !creatorList.isEmpty()){
      //2. getting user info
      List<String> usernameList = creatorList.stream()
                                             .map(dataCreatorDTO -> dataCreatorDTO.getUsername())
                                             .collect(Collectors.toList());
      List<UserProjections.ForMetadataCreatorListProjection> userList
          = userRepository.findByUsernames(usernameList, UserProjections.ForMetadataCreatorListProjection.class);
      creatorList.stream().forEach(dataCreatorDTO -> {
        String username = dataCreatorDTO.getUsername();
        Optional<UserProjections.ForMetadataCreatorListProjection> user
            = userList.stream().filter(userDetail -> userDetail.getUsername().equals(username)).findFirst();
        if(user.isPresent()){
          dataCreatorDTO.setCreator(user.get());
        }
      });

      //3. getting favorite
      List<String> favoriteCreatorIdList = favoriteService.getFavoriteDomainIdList(usernameList, DomainType.METADATA_CREATOR);
      creatorList.stream().forEach(dataCreatorDTO -> {
        String username = dataCreatorDTO.getUsername();
        dataCreatorDTO.setFavorite(favoriteCreatorIdList != null && favoriteCreatorIdList.contains(username));
      });

      //4. getting created data (recently created top 5)
      creatorList.stream().forEach(dataCreatorDTO -> {
        String username = dataCreatorDTO.getUsername();
        List<MetadataProjections.ForMetadataCreatorList> top5List
            = metadataRepository.findTop5ByCreatedByOrderByCreatedTimeDesc(username, MetadataProjections.ForMetadataCreatorList.class);
        dataCreatorDTO.setDataList(top5List);
      });

      //5. sorting favorite, data count
      creatorList.sort((a, b) -> {
        Boolean aFavorite = BooleanUtils.isTrue(a.getFavorite());
        Boolean bFavorite = BooleanUtils.isTrue(b.getFavorite());

        if(aFavorite && !bFavorite){
          return -1;
        } else if(bFavorite && !aFavorite){
          return 1;
        } else {
          Long aCount = a.getCount();
          Long bCount = b.getCount();
          if(aCount == bCount){
            return 0;
          } else if(aCount > bCount){
            return -1;
          } else {
            return 1;
          }
        }
      });
    }

    return creatorList;
  }

  public DataCreatorDTO getDataCreator(String username){
    DataCreatorDTO dataCreatorDTO = new DataCreatorDTO();

    //1. getting user
    BaseProjections.BaseProjectionCls creator
        = userRepository.findByUsername(username, UserProjections.ForMetadataCreatorDetailProjection.class);
    dataCreatorDTO.setCreator(creator);

    //2. getting favorite
    dataCreatorDTO.setFavorite(isFavoriteCreator(username));

    //3. getting follower list
    dataCreatorDTO.setFollowerList(getDataCreatorFollower(username));

    return dataCreatorDTO;
  }

  public List getDataCreatorFollower(String username){
    List<Favorite> followerIdList = favoriteRepository.findByTargetIdAndDomainType(username, DomainType.METADATA_CREATOR);
    if(followerIdList != null && !followerIdList.isEmpty()){
      List<String> usernameList = followerIdList.stream()
                                             .map(favorite -> favorite.getCreatedBy())
                                             .collect(Collectors.toList());

      List<UserProjections.ForMetadataCreatorListProjection> userList
          = userRepository.findByUsernames(usernameList, UserProjections.ForMetadataCreatorListProjection.class);
      return userList;
    }

    return null;
  }
}
