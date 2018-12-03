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

package app.metatron.discovery.domain.dataprep.service;

import app.metatron.discovery.domain.dataprep.entity.PrDataset;
import app.metatron.discovery.domain.dataprep.repository.PrDatasetRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.core.annotation.*;

@RepositoryEventHandler(PrDataset.class)
public class PrDatasetEventHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(PrDatasetEventHandler.class);

    @Autowired
    PrDatasetRepository datasetRepository;

    @Autowired
    PrDatasetService datasetService;

    @HandleBeforeCreate
    public void beforeCreate(PrDataset dataset) {
        // LOGGER.debug(dataset.toString());
    }

    @HandleAfterCreate
    public void afterCreate(PrDataset dataset) {
        /*
        LOGGER.debug(dataset.toString());
        try {

            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
            String oAuthToken = "bearer ";
            Cookie[] cookies = request.getCookies();
            for(int i=0; i<cookies.length; i++){
                if(cookies[i].getName().equals("LOGIN_TOKEN"))
                    oAuthToken = oAuthToken + cookies[i].getValue();
            }

            // excel to csv
            // below the file format is always csv
            if(dataset.getImportType() == PrDataset.IMPORT_TYPE.UPLOAD || dataset.getImportType() == PrDataset.IMPORT_TYPE.URI) {
                this.datasetService.changeExcelToCsv(dataset);
            }

            // upload file to storage
            if(dataset.getImportType() == PrDataset.IMPORT_TYPE.UPLOAD) {
                this.datasetService.uploadFileToStorage(dataset);
            }

            this.datasetService.savePreview(dataset, oAuthToken);

        } catch (Exception e) {
            LOGGER.debug(e.getMessage());
            throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_DATASET_FAILED_AFTERCREATE, e.getMessage());
        }

        this.datasetRepository.flush();
        */
    }

    @HandleBeforeSave
    public void beforeSave(PrDataset dataset) {
        // LOGGER.debug(dataset.toString());
    }

    @HandleAfterSave
    public void afterSave(PrDataset dataset) {
        // LOGGER.debug(dataset.toString());
    }
}
