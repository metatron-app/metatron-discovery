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

package app.metatron.discovery.domain.dataprep;

import app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.core.annotation.*;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;

@RepositoryEventHandler(PrepDataset.class)
public class PrepDatasetEventHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(PrepDatasetEventHandler.class);

    @Autowired
    PrepDatasetRepository datasetRepository;

    @Autowired
    PrepDatasetService datasetService;

    @HandleBeforeCreate
    public void beforeCreate(PrepDataset dataset) {
        // LOGGER.debug(dataset.toString());
    }

    @HandleAfterCreate
    public void afterCreate(PrepDataset dataset) {
        LOGGER.debug(dataset.toString());
        try {

            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
            String oAuthToken = "bearer ";
            Cookie[] cookies = request.getCookies();
            for(int i=0; i<cookies.length; i++){
                if(cookies[i].getName().equals("LOGIN_TOKEN"))
                    oAuthToken = oAuthToken + cookies[i].getValue();
            }

            this.datasetService.savePreview(dataset, oAuthToken);

        } catch (Exception e) {
            LOGGER.debug(e.getMessage());
            throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_DATASET_FAILED_AFTERCREATE, e.getMessage());
        }

        this.datasetRepository.flush();
    }

    @HandleBeforeSave
    public void beforeSave(PrepDataset dataset) {
        // LOGGER.debug(dataset.toString());
    }

    @HandleAfterSave
    public void afterSave(PrepDataset dataset) {
        // LOGGER.debug(dataset.toString());
    }
}
