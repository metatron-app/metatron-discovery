/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.audit;

import org.apache.commons.lang3.StringUtils;
import org.hibernate.envers.AuditReader;
import org.hibernate.envers.AuditReaderFactory;
import org.hibernate.envers.RevisionType;
import org.hibernate.envers.query.AuditEntity;
import org.hibernate.envers.query.AuditQuery;
import org.hibernate.envers.query.criteria.AuditCriterion;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import javax.persistence.EntityManager;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.revision.MetatronRevisionEntity;
import app.metatron.discovery.domain.user.User;
import app.metatron.discovery.domain.user.group.Group;
import app.metatron.discovery.domain.user.group.GroupMember;
import app.metatron.discovery.domain.user.group.GroupRepository;
import app.metatron.discovery.domain.user.role.RoleDirectory;

/**
 *
 */
@Service
public class DomainAuditService {

  @Autowired
  EntityManager entityManager;

  @Autowired
  GroupRepository groupRepository;

  public List<Object[]> getEntitiesAtRevision(DomainAuditType domainAuditType, Class domainClass, List<RevisionType> revisionTypes,
                                           String criterionProperty, String criterionValue, Long revisionId){
    AuditReader auditReader = AuditReaderFactory.get(entityManager);
    AuditQuery auditQuery = auditReader.createQuery()
                                       .forEntitiesAtRevision(domainClass, domainClass.getName(), revisionId, true)
                                       .addOrder(AuditEntity.revisionNumber().desc());

    //revisionType
    if(revisionTypes != null && !revisionTypes.isEmpty()){
      auditQuery.add(getAuditCriterionByRevisionType(revisionTypes));
    }

    //criterion
    if(StringUtils.isNotEmpty(criterionProperty) && StringUtils.isNotEmpty(criterionValue)){
      auditQuery.add(AuditEntity.property(criterionProperty).eq(criterionValue));
    }

    return auditQuery.getResultList();
  }

  public List<Object[]> getRevisionsOfEntityWithChanges(DomainAuditType domainAuditType, Class domainClass, List<RevisionType> revisionTypes,
                                     String criterionProperty, String criterionValue, int page, int size){
    AuditReader auditReader = AuditReaderFactory.get(entityManager);
    AuditQuery auditQuery = auditReader.createQuery()
                                       .forRevisionsOfEntityWithChanges(domainClass, true)
                                       .addOrder(AuditEntity.revisionNumber().desc());
    //offset
    if(page > -1 && size > 0){
      auditQuery.setFirstResult(page * size);
    }

    //size
    if(size > 0){
      auditQuery.setMaxResults(size);
    }

    //revisionType
    if(revisionTypes != null && !revisionTypes.isEmpty()){
      auditQuery.add(getAuditCriterionByRevisionType(revisionTypes));
    }

    //criterion
    if(StringUtils.isNotEmpty(criterionProperty) && StringUtils.isNotEmpty(criterionValue)){
      auditQuery.add(AuditEntity.property(criterionProperty).eq(criterionValue));
    }

    return auditQuery.getResultList();
  }

  public Object getRevisionCount(DomainAuditType domainAuditType, Class domainClass, List<RevisionType> revisionTypes,
                                 String criterionProperty, String criterionValue){
    AuditReader auditReader = AuditReaderFactory.get(entityManager);
    AuditQuery auditQuery = auditReader.createQuery()
                                       .forRevisionsOfEntityWithChanges(domainClass, true);

    //revisionType
    if(revisionTypes != null && !revisionTypes.isEmpty()){
      auditQuery.add(getAuditCriterionByRevisionType(revisionTypes));
    }

    //criterion
    if(StringUtils.isNotEmpty(criterionProperty) && StringUtils.isNotEmpty(criterionValue)){
      auditQuery.add(AuditEntity.property(criterionProperty).eq(criterionValue));
    }

    //projection
    auditQuery.addProjection(AuditEntity.id().count());
    return auditQuery.getSingleResult();
  }

  public List<DomainAudit> getDomainAuditList(DomainAuditType domainAuditType, Class domainClass, List<RevisionType> revisionTypes,
                                              String criterionProperty, String criterionValue, int page, int size){
    List<Object[]> auditResultList
        = getRevisionsOfEntityWithChanges(domainAuditType, domainClass, revisionTypes, criterionProperty, criterionValue, page, size);

    List<DomainAudit> domainAuditList = auditResultList.stream()
                                                       .map(objectArr -> convertAuditToDomainAudit(objectArr))
                                                       .collect(Collectors.toList());
    return domainAuditList;
  }

  public Page<DomainAudit> getPagedDomainAuditList(DomainAuditType domainAuditType, Class domainClass, List<RevisionType> revisionTypes,
                                                   String criterionProperty, String criterionValue, int page, int size){
    Long totalElements = (Long) getRevisionCount(domainAuditType, domainClass, revisionTypes, criterionProperty, criterionValue);
    List<DomainAudit> domainAuditList = getDomainAuditList(domainAuditType, domainClass, revisionTypes, criterionProperty, criterionValue, page, size);
    PageRequest pageRequest = new PageRequest(page, size);
    Page<DomainAudit> domainAuditPage = new PageImpl<>(domainAuditList, pageRequest, totalElements);
    return domainAuditPage;
  }

  public DomainAudit convertAuditToDomainAudit(Object[] auditObj){
    Object auditEntity = auditObj[0];
    MetatronRevisionEntity revisionEntity = (MetatronRevisionEntity) auditObj[1];

    //additional Group info for GroupMember (include deleted Group)
    if(auditEntity instanceof GroupMember){
      Long revisionId = revisionEntity.getId();
      List<Object[]> groupEntityList
          = getEntitiesAtRevision(null, Group.class, null, null, null, revisionId);

      if(groupEntityList != null && !groupEntityList.isEmpty()){
        Map auditEntityMap = GlobalObjectMapper.getDefaultMapper().convertValue(auditEntity, Map.class);
        auditEntityMap.put("group", groupEntityList.get(0));
        auditEntity = auditEntityMap;
      }
    }
    RevisionType revisionType = (RevisionType) auditObj[2];
    Set<String> propertiesChanged = (Set<String>) auditObj[3];
    return new DomainAudit(auditEntity, revisionEntity, revisionType, propertiesChanged);
  }

  public Class getDomainClassForName(DomainAuditType domainAuditType){
    Class cls = null;
    switch(domainAuditType){
      case USER :
        return User.class;
      case GROUP_MEMBER:
        return GroupMember.class;
      case ROLE_DIRECTORY:
        return RoleDirectory.class;
    }
    return cls;
  }

  public AuditCriterion getAuditCriterionByRevisionType(List<RevisionType> revisionTypes){
    AuditCriterion revisionCriterion = null;
    for(RevisionType revisionType : revisionTypes) {
      AuditCriterion criterion = AuditEntity.revisionType().eq(revisionType);
      if(revisionCriterion == null){
        revisionCriterion = criterion;
      } else {
        revisionCriterion = AuditEntity.or(revisionCriterion, criterion);
      }
    }
    return revisionCriterion;
  }
}
