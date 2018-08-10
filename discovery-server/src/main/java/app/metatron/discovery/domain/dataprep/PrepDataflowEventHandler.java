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

import com.google.common.collect.Lists;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.core.annotation.HandleAfterCreate;
import org.springframework.data.rest.core.annotation.HandleAfterSave;
import org.springframework.data.rest.core.annotation.HandleBeforeCreate;
import org.springframework.data.rest.core.annotation.HandleBeforeSave;
import org.springframework.data.rest.core.annotation.RepositoryEventHandler;

import java.util.List;

import app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.transform.PrepTransformResponse;
import app.metatron.discovery.domain.dataprep.transform.PrepTransformService;

@RepositoryEventHandler(PrepDataflow.class)
public class PrepDataflowEventHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(PrepDataflowEventHandler.class);

    @Autowired
    PrepDataflowRepository dataflowRepository;

    @Autowired(required = false)
    PrepTransformService transformService;

    @HandleBeforeCreate
    public void beforeCreate(PrepDataflow dataflow) {
        LOGGER.debug(dataflow.toString());
    }

    @HandleAfterCreate
    public void afterCreate(PrepDataflow dataflow) {
        LOGGER.debug(dataflow.toString());
        // concurrent 문제로 안됨
        try {
            List<PrepDataset> datasets = dataflow.getDatasets();
            List<PrepDataset> importedDatasets = Lists.newArrayList();
            for(PrepDataset dataset : datasets) {
                if(PrepDataset.DS_TYPE.IMPORTED==dataset.getDsTypeForEnum()) {
                    importedDatasets.add(dataset);
                }
            }
            for(PrepDataset dataset : importedDatasets) {
                PrepTransformResponse response = this.transformService.create(dataset.getDsId(), dataflow.getDfId());
            }
        } catch (Exception e) {
            LOGGER.error("afterCreate(): caught an exception: ", e);
            throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, e);
        }
    }

    @HandleBeforeSave
    public void beforeSave(PrepDataflow dataflow) {
        LOGGER.debug(dataflow.toString());
    }

    @HandleAfterSave
    public void afterSave(PrepDataflow dataflow) {
        LOGGER.debug(dataflow.toString());
    }
}

