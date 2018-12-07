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
        // LOGGER.debug(dataset.toString());
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
