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

package app.metatron.discovery.common.revision;

import com.google.common.collect.Maps;

import org.hibernate.envers.boot.internal.EnversService;
import org.hibernate.envers.event.spi.EnversPostInsertEventListenerImpl;
import org.hibernate.event.spi.PostInsertEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.StatLogger;
import app.metatron.discovery.domain.revision.MetatronRevisionDto;
import app.metatron.discovery.domain.revision.MetatronRevisionEntity;

public class CustomEnversPostInsertEventListener extends EnversPostInsertEventListenerImpl {

  private static Logger LOGGER = LoggerFactory.getLogger(CustomEnversPostInsertEventListener.class);

  public CustomEnversPostInsertEventListener(EnversService enversService) {
    super(enversService);
  }

  @Override
  public void onPostInsert(PostInsertEvent event) {
    try {
      String entityName = event.getPersister().getEntityName();
      if (entityName.endsWith("_AUD")) {
        LOGGER.debug(GlobalObjectMapper.writeValueAsString(event.getEntity()));

        Map dataMap = (HashMap) event.getEntity();
        String revisionType = dataMap.get("REVTYPE").toString();
        MetatronRevisionDto metatronRevisionDto = new MetatronRevisionDto();
        HashMap<String, Object> additionalInformation = Maps.newHashMap();
        if ("MOD".equals(revisionType)) {
          String modifiedFlagSuffix = this.getEnversService().getGlobalConfiguration().getModifiedFlagSuffix();
          Iterator iterator = dataMap.entrySet().iterator();

          while (iterator.hasNext()) {
            Map.Entry<String, Object> entry = (Map.Entry)iterator.next();
            String key = entry.getKey();
            if (key.endsWith(modifiedFlagSuffix) && entry.getValue() != null && Boolean.parseBoolean(entry.getValue().toString())) {
              String propertyName = key.substring(0, key.length() - modifiedFlagSuffix.length());
              additionalInformation.put(propertyName, dataMap.get(propertyName));
            }
          }
        } else {
          if (entityName.indexOf("User_AUD") > -1) {
            additionalInformation.put("fullName", dataMap.get("fullName"));
          } else if (entityName.indexOf("Group_AUD") > -1) {
            additionalInformation.put("name", dataMap.get("name"));
          } else if (entityName.indexOf("GroupMember_AUD") > -1) {
            additionalInformation.put("group_id", dataMap.get("group_id"));
            additionalInformation.put("memberId", dataMap.get("memberId"));
            additionalInformation.put("memberName", dataMap.get("memberName"));
          } else if (entityName.indexOf("RoleDirectory_AUD") > -1) {
            additionalInformation.put("role_id", dataMap.get("role_id"));
            additionalInformation.put("type", dataMap.get("type"));
            additionalInformation.put("directoryId", dataMap.get("directoryId"));
            additionalInformation.put("directoryName", dataMap.get("directoryName"));
          }
        }
        metatronRevisionDto.setAdditionalInformation(additionalInformation);

        Map originalId = (HashMap) dataMap.get("originalId");
        MetatronRevisionEntity rev = (MetatronRevisionEntity) originalId.get("REV");
        metatronRevisionDto.setRevisionType(revisionType);
        metatronRevisionDto.setRevisionDate(new SimpleDateFormat(StatLogger.DATE_FORMAT).format(rev.getRevisionDate()));
        metatronRevisionDto.setUserName(rev.getUsername());

        metatronRevisionDto.setTargetId(originalId.get("id").toString());
        metatronRevisionDto.setTargetType(entityName.substring(entityName.lastIndexOf(".") +1).replace("_AUD", "").toUpperCase());

        StatLogger.revision(metatronRevisionDto);
      }
    } catch (Exception e) {
      LOGGER.error(e.getMessage(), e);
    }

    super.onPostInsert(event);
  }

}
