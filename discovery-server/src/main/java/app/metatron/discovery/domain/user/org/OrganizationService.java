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

package app.metatron.discovery.domain.user.org;

import com.google.common.collect.Sets;

import com.querydsl.core.types.Predicate;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

import app.metatron.discovery.common.exception.MetatronException;
import app.metatron.discovery.common.exception.ResourceNotFoundException;
import app.metatron.discovery.domain.CollectionPatch;
import app.metatron.discovery.domain.user.CachedUserService;
import app.metatron.discovery.domain.user.DirectoryProfile;
import app.metatron.discovery.domain.user.User;
import app.metatron.discovery.domain.user.UserRepository;
import app.metatron.discovery.domain.user.group.Group;
import app.metatron.discovery.domain.user.group.GroupRepository;
import app.metatron.discovery.util.EnumUtils;
import app.metatron.discovery.util.PolarisUtils;

/**
 * Service class of Organization
 */
@Component
@Transactional
public class OrganizationService {

  private static final Logger LOGGER = LoggerFactory.getLogger(OrganizationService.class);

  @Autowired
  OrganizationRepository orgRepository;

  @Autowired
  OrganizationMemberRepository orgMemberRepository;

  @Autowired
  UserRepository userRepository;

  @Autowired
  GroupRepository groupRepository;

  @Autowired
  CachedUserService cachedUserService;

  public OrganizationService() {
    // Empty Constructor
  }

  /**
   * Create a organization
   *
   * @param organization
   * @return
   */
  public Organization create(Organization organization) {

    if (StringUtils.isEmpty(organization.getCode())) {
      organization.setCode(PolarisUtils.randomString(10));
    }

    return orgRepository.save(organization);
  }

  /**
   * Update the organization
   *
   * @param organization
   * @return
   */
  public Organization update(Organization organization) {

    Organization persistOrg = findOrganizationByCode(organization.getCode());

    persistOrg.update(organization);

    return orgRepository.save(persistOrg);
  }

  /**
   * Delete organization by organization code
   *
   * @param code
   */
  public void delete(String code) {

    if (Organization.DEFAULT_ORGANIZATION_CODE.equals(code)) {
      throw new MetatronException("Not allow to delete default organization");
    }

    Organization persistOrg = findOrganizationByCode(code);
    orgRepository.delete(persistOrg);
  }

  public void addMembers(List<String> codes, String memberId, String memberName, DirectoryProfile.Type type) {

    if (CollectionUtils.isEmpty(codes)) {
      addMember(Organization.DEFAULT_ORGANIZATION_CODE, memberId, memberName, type);
    } else {
      for (String orgCode : codes) {
        try {
          addMember(orgCode, memberId, memberName, type);
        } catch (ResourceNotFoundException rne) {
          addMember(Organization.DEFAULT_ORGANIZATION_CODE, memberId, memberName, type);
        }
      }
    }

  }

  private void addMember(String code, String memberId, String memberName, DirectoryProfile.Type type) {

    //remove member from previous org
    deleteOrgMembers(memberId);

    Organization persistOrg = findOrganizationByCode(code);

    persistOrg.addMember(new OrganizationMember(memberId, memberName, type));

    orgRepository.save(persistOrg);

    cachedUserService.removeCacheByType(memberId, type);
  }

  /**
   * delete all members by member identifier
   *
   * @param memberId
   */
  @Transactional
  public void deleteOrgMembers(String memberId) {
    Long cnt = orgMemberRepository.deleteByMemberId(memberId);
    LOGGER.info("Successfully deleted {} members included in organizations", cnt);
  }

  /**
   * Update members of organization
   *
   * @param code
   * @param patchMembers
   */
  public void updateOrgMembers(String code, List<CollectionPatch> patchMembers) {

    Organization persistOrg = findOrganizationByCode(code);

    for (CollectionPatch patch : patchMembers) {

      String memberId = patch.getValue("memberId");
      DirectoryProfile.Type memberType = EnumUtils.getUpperCaseEnum(DirectoryProfile.Type.class,
              patch.getValue("type"),
              DirectoryProfile.Type.USER);

      switch (patch.getOp()) {
        case ADD:
          String memberName;
          if (memberType == DirectoryProfile.Type.USER) {
            User realUser = cachedUserService.findUser(memberId);
            if (realUser == null) {
              continue;
            }
            memberName = realUser.getFullName();
            // need to refresh cache
            cachedUserService.removeCacheByType(memberId, DirectoryProfile.Type.USER);
          } else {
            Group group = groupRepository.findOne(memberId);
            if (group == null) {
              continue;
            }
            memberName = group.getName();
          }

          //If it is already included as a member, it will be removed.
          orgMemberRepository.deleteByMemberId(memberId);

          persistOrg.addMember(new OrganizationMember(memberId, memberName, memberType));
          break;

        case REMOVE:
          OrganizationMember removeMember = orgMemberRepository.findByOrganizationAndMemberId(persistOrg, memberId);
          if (removeMember != null) {
            cachedUserService.removeCacheByType(removeMember.getMemberId(), removeMember.getType());
            persistOrg.removeMember(removeMember);
          }
          break;
        default:
          LOGGER.warn("Not supported action");
      }
    }

    orgRepository.save(persistOrg);
  }

  /**
   * Find a organization by identifier
   *
   * @param id identifier of organization
   * @return
   */
  @Transactional(readOnly = true)
  public Organization findOrganization(String id) {

    Organization persistOrg = orgRepository.findOne(id);
    if (persistOrg == null) {
      throw new ResourceNotFoundException(id);
    }

    return persistOrg;
  }

  /**
   * Find a organization by code
   *
   * @param code Code of organization
   * @return
   */
  @Transactional(readOnly = true)
  public Organization findOrganizationByCode(String code) {

    Organization persistOrg = orgRepository.findByCode(code);
    if (persistOrg == null) {
      throw new ResourceNotFoundException(code);
    }

    return persistOrg;
  }

  /**
   * Search organizations by conditions
   *
   * @param nameContains
   * @param searchDateBy
   * @param from
   * @param to
   * @param pageable
   * @return
   */
  @Transactional(readOnly = true)
  public Page<Organization> search(String nameContains, String searchDateBy, DateTime from, DateTime to,
          Pageable pageable) {

    // Get Predicate
    Predicate searchPredicated = OrganizationPredicate.searchOrgList(nameContains, searchDateBy, from, to);

    return orgRepository.findAll(searchPredicated, pageable);
  }

  /**
   * Search organization members by conditions
   *
   * @param code
   * @param nameContains
   * @param type
   * @param pageable
   * @return
   */
  @Transactional(readOnly = true)
  public Page<OrganizationMember> searchOrgMembers(String code, String nameContains, DirectoryProfile.Type type,
          Pageable pageable) {

    Page<OrganizationMember> members = orgMemberRepository.findAll(
            OrganizationPredicate.searchOrgMemberList(code, nameContains, type), pageable);

    return members;
  }

  /**
   * Check whether name duplicate other one of organization
   *
   * @param orgName
   * @return
   */
  @Transactional(readOnly = true)
  public boolean checkDuplicatedName(String orgName) {
    return orgRepository.exists(OrganizationPredicate.searchDuplicatedName(orgName));
  }

  /**
   * Check whether code duplicate other one of organization
   *
   * @param orgCode
   * @return
   */
  @Transactional(readOnly = true)
  public boolean checkDuplicatedCode(String orgCode) {
    return orgRepository.exists(OrganizationPredicate.searchDuplicatedCode(orgCode));
  }

  /**
   * Find the codes of members organization
   *
   * @param memberId
   * @return
   */
  public List<String> findCodesOfMembersOrg(String memberId) {
    return orgRepository.findOrgCodesByMemberId(memberId, null);
  }

  /**
   * Initialize Organization
   */
  public void init() {
    /*
     * Users must belong to at least one organization.
     * Users who do not belong to the organization are automatically included in the default organization.
     *
     * Initialization proceeds with the assumption that there will not be many users and groups.
     * If there are many users, you should consider separate logic.
     */

    LOGGER.info("Start to initialize organization process.");

    // Fetch all organization members and classify member by type
    List<OrganizationMember> allMember = orgMemberRepository.findAll();

    Set<String> usernames = Sets.newHashSet();
    Set<String> groupIds = Sets.newHashSet();
    for (OrganizationMember member : allMember) {
      if (member.getType() == DirectoryProfile.Type.USER) {
        usernames.add(member.getMemberId());
      } else {
        groupIds.add(member.getMemberId());
      }
    }

    // Move user to default organization
    List<User> users = userRepository.findAll();
    for (User user : users) {
      if (usernames.contains(user.getUsername())) {
        continue;
      }
      addMember(Organization.DEFAULT_ORGANIZATION_CODE, user.getUsername(), user.getFullName(),
              DirectoryProfile.Type.USER);
    }

    // Move group to default organization
    List<Group> groups = groupRepository.findAll();
    for (Group group : groups) {
      if (groupIds.contains(group.getId())) {
        continue;
      }
      addMember(Organization.DEFAULT_ORGANIZATION_CODE, group.getId(), group.getName(), DirectoryProfile.Type.GROUP);
    }

    LOGGER.info("Finished the organization process..");

  }

}
