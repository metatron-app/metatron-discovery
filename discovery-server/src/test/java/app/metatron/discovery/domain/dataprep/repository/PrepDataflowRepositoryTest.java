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

import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

import app.metatron.discovery.AbstractIntegrationTest;
import app.metatron.discovery.domain.dataprep.PrepDataflow;
import app.metatron.discovery.domain.dataprep.PrepDataflowRepository;

/**
 * Created by kaypark on 2017. 6. 29..
 */
public class PrepDataflowRepositoryTest extends AbstractIntegrationTest {

    @Autowired
    PrepDataflowRepository dataflowRepository;

    @Test
    public void saveTest() {
        PrepDataflow dataflow = new PrepDataflow();
        dataflow.setDfName("test dataflow name");
        dataflow.setDfDesc("test dataflow description");

        dataflowRepository.saveAndFlush(dataflow);

        System.out.println(ToStringBuilder.reflectionToString(dataflow, ToStringStyle.MULTI_LINE_STYLE));
    }

    @Test
    public void crudTest() {
        PrepDataflow dataflow = new PrepDataflow();
        dataflow.setDfName("test dataflow name");
        dataflow.setDfDesc("test dataflow description");

        dataflowRepository.saveAndFlush(dataflow);
        System.out.println(ToStringBuilder.reflectionToString(dataflow, ToStringStyle.MULTI_LINE_STYLE));

        PrepDataflow savedDataflow = dataflowRepository.getOne(dataflow.getDfId());
        System.out.println("SAVE:: " + ToStringBuilder.reflectionToString(savedDataflow, ToStringStyle.MULTI_LINE_STYLE));

        savedDataflow.setCustom("test custom");

        dataflowRepository.saveAndFlush(savedDataflow);
        System.out.println(ToStringBuilder.reflectionToString(savedDataflow, ToStringStyle.MULTI_LINE_STYLE));

        PrepDataflow updatedDataflow = dataflowRepository.findOne(dataflow.getDfId());
        System.out.println("UPDATE:: " + ToStringBuilder.reflectionToString(updatedDataflow, ToStringStyle.MULTI_LINE_STYLE));

    }

    @Test
    public void findDataflows() {
        List<PrepDataflow> dataflows = dataflowRepository.findAll();
        for(PrepDataflow dataflow : dataflows) {
            System.out.println(ToStringBuilder.reflectionToString(dataflow, ToStringStyle.MULTI_LINE_STYLE));
        }
    }

}


