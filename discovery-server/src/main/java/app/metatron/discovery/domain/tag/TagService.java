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

package app.metatron.discovery.domain.tag;

import com.google.common.collect.Lists;

import com.querydsl.core.types.Predicate;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import app.metatron.discovery.common.entity.DomainType;
import app.metatron.discovery.domain.mdm.MetadataRepository;
import app.metatron.discovery.domain.user.UserController;
import app.metatron.discovery.util.ProjectionUtils;

@Component
@Transactional(readOnly = true)
public class TagService {

  private static final Logger LOGGER = LoggerFactory.getLogger(UserController.class);

  @Autowired
  public TagRepository tagRepository;

  @Autowired
  MetadataRepository metadataRepository;

  @Autowired
  public ProjectionFactory projectionFactory;

  TagProjections tagProjections = new TagProjections();

  public List findByTagsInDomainItem(Tag.Scope scope, DomainType domainType, String domainId, String projection) {
    List tags = tagRepository.findByTagsInDomainItem(scope, domainType, domainId);
    return ProjectionUtils.toListResource(projectionFactory, tagProjections.getProjectionByName(projection), tags);
  }

  public List<Tag> findByTagsWithDomain(Tag.Scope scope, DomainType domainType, String nameContains, Sort sort) {
    Predicate predicate = TagPredicate.searchList(scope, domainType, nameContains);
    return Lists.newArrayList(tagRepository.findAll(predicate, sort));
  }

  @Transactional
  public void updateTagsInDomainItem(Tag.Scope scope, DomainType domainType, String domainId, List<String> tags) {

    long detachedTagCount = tagRepository.detachTag(scope, domainType, domainId, null);
    LOGGER.debug("Detached tags count : {}", detachedTagCount);

    attachTagsToDomainItem(scope, domainType, domainId, tags);
  }

  @Transactional
  public void attachTagsToDomainItem(Tag.Scope scope, DomainType domainType, String domainId, List<String> tags) {

    for (String tagName : tags) {
      TagDomain tagDomain = new TagDomain(domainType, domainId);

      Tag tag = tagRepository.findByTagNameAndDomain(scope, domainType, tagName);
      if(tag == null) {
        tag = new Tag(tagName, scope, domainType);
      }

      tag.addTagDomain(tagDomain);

      tagRepository.save(tag);
      LOGGER.debug("Add Tags to Item : {}", tag);
    }
  }

  @Transactional
  public void detachTagsFromDomainItem(Tag.Scope scope, DomainType domainType, String domainId, List<String> tags) {
    tagRepository.detachTag(scope, domainType, domainId, tags);
  }

  @Transactional
  public void deleteTags(Tag.Scope scope, DomainType domainType, List<String> tags) {

    for (String tagName : tags) {
      Tag tag = tagRepository.findByTagNameAndDomain(scope, domainType, tagName);
      if(tag != null) {
        tagRepository.delete(tag);
        LOGGER.debug("Successfully delete tags : {} ({}, {})", tagName, scope, domainType);
      }
    }
  }

  public List<TagTreeDTO> getTagsWithCount(Tag.Scope scope, DomainType domainType, String nameContains, Sort sort) {

    List<TagTreeDTO> tagTreeDTOList = new ArrayList<>();

    //Whole tag list
    List<Tag> tagList = this.findByTagsWithDomain(scope, domainType, nameContains, sort);

    switch(domainType){
      case METADATA:
        //getting metadata count..
        //jpa can't join with non-relation entity, and can't join with sub-query
        //Only tags with domain exists
        List<TagTreeDTO> metadataCountList
            = tagRepository.findTagsAndCountWithMetadatas(scope, domainType, StringUtils.isEmpty(nameContains) ? "" : nameContains);

        //filter non-exist
        for(Tag tag : tagList) {
          Optional<TagTreeDTO> optionalTagTreeDTO = metadataCountList.stream()
                                                                     .filter(tagTreeDTO -> tagTreeDTO.getId().equals(tag.getId()))
                                                                     .findFirst();
          if(optionalTagTreeDTO.isPresent()){
            tagTreeDTOList.add(optionalTagTreeDTO.get());
          } else {
            tagTreeDTOList.add(new TagTreeDTO(tag.id, tag.name));
          }
        }
        break;
      default:
        for(Tag tag : tagList) {
          tagTreeDTOList.add(new TagTreeDTO(tag.id, tag.name));
        }
        break;
    }

    return tagTreeDTOList;
  }

}
