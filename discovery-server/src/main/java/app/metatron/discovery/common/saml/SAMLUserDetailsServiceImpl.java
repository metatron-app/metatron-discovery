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

package app.metatron.discovery.common.saml;

import app.metatron.discovery.domain.user.UserRepository;
import app.metatron.discovery.domain.user.UserService;
import app.metatron.discovery.domain.user.group.Group;
import app.metatron.discovery.domain.user.group.GroupMember;
import app.metatron.discovery.domain.user.group.GroupService;
import app.metatron.discovery.domain.user.role.RoleService;
import app.metatron.discovery.domain.user.role.RoleSet;
import app.metatron.discovery.domain.user.role.RoleSetRepository;
import app.metatron.discovery.domain.user.role.RoleSetService;
import app.metatron.discovery.domain.workspace.Workspace;
import app.metatron.discovery.domain.workspace.WorkspaceRepository;
import app.metatron.discovery.util.PolarisUtils;
import org.apache.commons.lang3.StringUtils;
import org.hibernate.Session;
import org.opensaml.saml2.core.Attribute;
import org.opensaml.xml.XMLObject;
import org.opensaml.xml.schema.XSString;
import org.opensaml.xml.schema.impl.XSAnyImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.saml.SAMLCredential;
import org.springframework.security.saml.userdetails.SAMLUserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import java.lang.reflect.Constructor;
import java.util.HashMap;
import java.util.Map;

/**
 * this class is autowired to the SamlProvider, so it tries to get the user's details from the token using this 
 * class, o/w it returns null.
 * @author Ohad
 *
 */
@Component
@Transactional
public class SAMLUserDetailsServiceImpl implements SAMLUserDetailsService{

  private static final Logger LOGGER = LoggerFactory.getLogger(SAMLUserDetailsServiceImpl.class);

	@Autowired
	UserRepository userRepository;

	@Autowired
	UserService userService;

	@Autowired
	RoleService roleService;

	@Autowired
	GroupService groupService;

	@Autowired
	WorkspaceRepository workspaceRepository;

	@Autowired
	RoleSetRepository roleSetRepository;

	@Autowired
	RoleSetService roleSetService;

	@Autowired
  EntityManager entityManager;

	@Autowired
  SAMLProperties samlProperties;

	@Override
	public UserDetails loadUserBySAML(SAMLCredential credential) throws UsernameNotFoundException{
		String nameID = credential.getNameID().getValue();
    LOGGER.debug("loadUserBySAML from {}, for : {}", credential.getRemoteEntityID(), nameID);

		//신규 유저 등록
    UserDetails metatronUser = userRepository.findByUsername(nameID);
		if(metatronUser == null) {
      LOGGER.debug("{} is not metatron user.", nameID);
			metatronUser = createMetatronUser(credential, getUserMapper(credential));
		} else {
      LOGGER.debug("{} is metatron user.", nameID);
    }

    ((app.metatron.discovery.domain.user.User) metatronUser).setRoleService(roleService);

    // 권한 정보 미리 로드
    metatronUser.getAuthorities();

		return metatronUser;
	}

  @Transactional
	public app.metatron.discovery.domain.user.User createMetatronUser(SAMLCredential credential, SAMLUserMapper samlUserMapper){
    LOGGER.debug("create metatron user for {}", credential.getNameID().getValue());

	  app.metatron.discovery.domain.user.User metatronUser;

		if(samlUserMapper == null){
      metatronUser = new app.metatron.discovery.domain.user.User();
    } else {
		  metatronUser = samlUserMapper.createUser(credential);
    }

		//UserName은 NameID사용
		String nameID = credential.getNameID().getValue();
		metatronUser.setUsername(nameID);
		metatronUser.setUserOrigin(credential.getRemoteEntityID());

    for(Attribute attr : credential.getAttributes()){
      Map<String, String> attrMap = new HashMap<>();
      attrMap.put("name", attr.getName());
      attrMap.put("friendlyName", attr.getFriendlyName());
      attrMap.put("value", credential.getAttributeAsString(attr.getName()));
			LOGGER.debug("name : {}, value : {}, friendlyName : {}", attrMap.get("name"), attrMap.get("value"), attrMap.get("friendlyName"));
    }

		if (StringUtils.isBlank(metatronUser.getFullName())) {
			metatronUser.setFullName(metatronUser.getUsername());
		}

		// mail 전송을 수행하지 않고 패스워드를 지정하지 않은 경우 시스템에서 비번 생성
		metatronUser.setPassword(PolarisUtils.createTemporaryPassword(8));

    //기본은 deactivated
		metatronUser.setStatus(app.metatron.discovery.domain.user.User.Status.ACTIVATED);

		// Group 정보가 없을 경우 기본그룹 지정
		Group defaultGroup = groupService.getDefaultGroup();
		if (defaultGroup == null) {
			LOGGER.warn("Default group not found.");
		} else {
      Session session = entityManager.unwrap(org.hibernate.Session.class);
			defaultGroup.addGroupMember(new GroupMember(metatronUser.getUsername(), metatronUser.getFullName()));
		}

    userRepository.save(metatronUser);

		// 워크스페이스 생성(등록된 워크스페이스가 없을 경우 생성)
		RoleSet roleSet = roleSetService.getDefaultRoleSet();

		Workspace workspace = new Workspace();
		workspace.setPublicType(Workspace.PublicType.PRIVATE);
		workspace.setName(metatronUser.getFullName() + " Workspace");
		workspace.setOwnerId(metatronUser.getUsername());
		workspace.addRoleSet(roleSet);

		if(StringUtils.isNotEmpty(metatronUser.getWorkspaceType())
						&& Workspace.workspaceTypes.contains(metatronUser.getWorkspaceType())) {
			workspace.setType(metatronUser.getWorkspaceType());
		} else {
			workspace.setType(Workspace.workspaceTypes.get(0)); // "DEFAULT" 셋팅
		}

		workspaceRepository.saveAndFlush(workspace);

		return metatronUser;
	}

	private SAMLUserMapper getUserMapper(SAMLCredential samlCredential) throws AuthenticationException{
    LOGGER.debug("search user mapper for remoteEntity {}", samlCredential.getRemoteEntityID());

    //need add property userMapperClass
		//ex) polaris.saml.userMapperClass=app.metatron.discovery.common.saml.SAMLBhartiUserMapper
		String userMapperClassName = samlProperties.userMapperClass;
		LOGGER.debug("found userMapperClassName : {}", userMapperClassName);
		
		if(StringUtils.isNotEmpty(userMapperClassName)){
			try{
				Class<?> clazz = Class.forName(userMapperClassName);
				Constructor<?> ctor = clazz.getConstructor();
				return (SAMLUserMapper) ctor.newInstance();
			} catch (Exception e){
			}
		}
		return null;
  }

  private String getAttributeValue(XMLObject attributeValue){
    String returnValue;

    if(attributeValue == null){
      returnValue = null;
    } else if(attributeValue instanceof XSString){
      returnValue = getStringAttributeValue((XSString) attributeValue);
    } else if(attributeValue instanceof XSAnyImpl){
      returnValue = getAnyAttributeValue((XSAnyImpl) attributeValue);
    } else {
      returnValue = attributeValue.toString();
    }
    return returnValue;
  }

  private String getStringAttributeValue(XSString attributeValue){
    return attributeValue.getValue();
  }

  private String getAnyAttributeValue(XSAnyImpl attributeValue){
    return attributeValue.getTextContent();
  }


}
