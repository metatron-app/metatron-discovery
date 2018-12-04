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

package app.metatron.discovery.domain.dataprep.repository;

import app.metatron.discovery.AbstractIntegrationTest;
import app.metatron.discovery.domain.dataprep.entity.PrDataset;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

import static app.metatron.discovery.domain.dataprep.entity.PrDataset.DS_TYPE.IMPORTED;

public class PrDatasetRepositoryTest extends AbstractIntegrationTest {

    @Autowired
    PrDatasetRepository datasetRepository;


    @Test
    public void saveDbTypeTest() {
        PrDataset dataset = new PrDataset();
        dataset.setDsName("test db type dataset name");
        dataset.setDsDesc("test db type dataset description");
        dataset.setDsType(IMPORTED);
        dataset.setImportType(PrDataset.IMPORT_TYPE.DATABASE);

        datasetRepository.saveAndFlush(dataset);

        System.out.println(ToStringBuilder.reflectionToString(dataset, ToStringStyle.MULTI_LINE_STYLE));
    }

    @Test
    public void saveTest() {
        PrDataset dataset = new PrDataset();
        dataset.setDsName("test dataset name");
        dataset.setDsDesc("test dataset description");
        dataset.setDsType(IMPORTED);
        dataset.setStoredUri("test_stored_uri");

        datasetRepository.saveAndFlush(dataset);

        System.out.println(ToStringBuilder.reflectionToString(dataset, ToStringStyle.MULTI_LINE_STYLE));
    }

    @Test
    public void crudTest() {
        PrDataset dataset = new PrDataset();
        dataset.setDsName("test dataset name");
        dataset.setDsDesc("test dataset description");
        dataset.setDsType(IMPORTED);

        datasetRepository.saveAndFlush(dataset);
        System.out.println(ToStringBuilder.reflectionToString(dataset, ToStringStyle.MULTI_LINE_STYLE));

        PrDataset savedDataset = datasetRepository.getOne(dataset.getDsId());
        System.out.println("SAVE:: " + ToStringBuilder.reflectionToString(savedDataset, ToStringStyle.MULTI_LINE_STYLE));

        savedDataset.setFilenameBeforeUpload("test_filename_before_upload");

        datasetRepository.saveAndFlush(savedDataset);
        System.out.println(ToStringBuilder.reflectionToString(savedDataset, ToStringStyle.MULTI_LINE_STYLE));

        PrDataset updatedDataset = datasetRepository.findOne(dataset.getDsId());
        System.out.println("UPDATE:: " + ToStringBuilder.reflectionToString(updatedDataset, ToStringStyle.MULTI_LINE_STYLE));

    }

    @Test
    public void deleteDataset() {

        PrDataset dataset = new PrDataset();
        dataset.setDsName("test dataset name");
        dataset.setDsDesc("test dataset description");
        dataset.setDsType(IMPORTED);
        dataset.setStoredUri("test_stored_uri");

        datasetRepository.saveAndFlush(dataset);

        dataset = datasetRepository.findOne(dataset.getDsId());
        datasetRepository.delete(dataset.getDsId());

        dataset = datasetRepository.findOne(dataset.getDsId());
        if(dataset==null) {
            System.out.println("DELETE:: success");
        } else {
            System.out.println("DELETE:: failed - " + ToStringBuilder.reflectionToString(dataset, ToStringStyle.MULTI_LINE_STYLE));
        }
    }

    @Test
    public void findDatasets() {
        List<PrDataset> datasets = datasetRepository.findAll();
        for(PrDataset dataset : datasets) {
            System.out.println(ToStringBuilder.reflectionToString(dataset, ToStringStyle.MULTI_LINE_STYLE));
        }
    }

    /*
    @Test
    public void findPreviewLineOfDatasets() {
        List<PrDataset> datasets = datasetRepository.findAll();
        for(PrDataset dataset : datasets) {
            if(null!=dataset.getPreviewLines()) {
                System.out.println("Preview of " + dataset.getDsId() + ": " + ToStringBuilder.reflectionToString(dataset.getPreviewLines(), ToStringStyle.MULTI_LINE_STYLE));
            }
        }
    }
    */
}

