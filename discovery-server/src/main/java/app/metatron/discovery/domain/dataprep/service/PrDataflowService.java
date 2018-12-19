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

import app.metatron.discovery.domain.dataprep.entity.PrDataflow;
import app.metatron.discovery.domain.dataprep.entity.PrDataset;
import app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.repository.PrDataflowRepository;
import app.metatron.discovery.domain.dataprep.transform.PrepTransformResponse;
import app.metatron.discovery.domain.dataprep.transform.PrepTransformService;
import com.google.common.collect.Lists;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.util.List;

@Service
@Transactional
public class PrDataflowService {
    private static Logger LOGGER = LoggerFactory.getLogger(PrDataflowService.class);

    @Autowired
    PrDataflowRepository dataflowRepository;

    @Autowired
    private PrepTransformService transformService;

    @PersistenceContext
    EntityManager em;

    public void afterCreate(PrDataflow dataflow) throws PrepException {
        try {
            List<PrDataset> datasets = dataflow.getDatasets();
            List<PrDataset> importedDatasets = Lists.newArrayList();
            for(PrDataset dataset : datasets) {
                if(PrDataset.DS_TYPE.IMPORTED == dataset.getDsType()) {
                    importedDatasets.add(dataset);
                }
            }
            for(PrDataset dataset : importedDatasets) {
                PrepTransformResponse response = this.transformService.create(dataset.getDsId(), dataflow.getDfId(), true);
            }
        } catch (Exception e) {
            LOGGER.error("afterCreate(): caught an exception: ", e);
            throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, e);
        }

    }
}
