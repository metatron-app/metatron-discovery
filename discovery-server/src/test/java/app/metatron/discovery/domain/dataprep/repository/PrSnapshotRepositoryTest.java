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

import app.metatron.discovery.domain.dataprep.entity.PrSnapshot;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

import app.metatron.discovery.AbstractIntegrationTest;

/**
 * Created by kaypark on 2017. 7. 4..
 */
public class PrSnapshotRepositoryTest extends AbstractIntegrationTest {

    @Autowired
    PrSnapshotRepository snapshotRepository;

    @Test
    public void saveTest() {
        PrSnapshot snapshot = new PrSnapshot();
        snapshot.setSsName("test snapshot name");

        snapshotRepository.saveAndFlush(snapshot);

        System.out.println(ToStringBuilder.reflectionToString(snapshot, ToStringStyle.MULTI_LINE_STYLE));
    }

    @Test
    public void crudTest() {
        PrSnapshot snapshot = new PrSnapshot();
        snapshot.setSsName("test snapshot name");

        snapshotRepository.saveAndFlush(snapshot);
        System.out.println(ToStringBuilder.reflectionToString(snapshot, ToStringStyle.MULTI_LINE_STYLE));

        PrSnapshot savedSnapshot = snapshotRepository.getOne(snapshot.getSsId());
        System.out.println("SAVE:: " + ToStringBuilder.reflectionToString(savedSnapshot, ToStringStyle.MULTI_LINE_STYLE));

        savedSnapshot.setSsName("test snapshot name changed");

        snapshotRepository.saveAndFlush(savedSnapshot);
        System.out.println(ToStringBuilder.reflectionToString(savedSnapshot, ToStringStyle.MULTI_LINE_STYLE));

        PrSnapshot updatedSnapshot = snapshotRepository.findOne(snapshot.getSsId());
        System.out.println("UPDATE:: " + ToStringBuilder.reflectionToString(updatedSnapshot, ToStringStyle.MULTI_LINE_STYLE));

    }

    @Test
    public void findSnapshots() {
        List<PrSnapshot> snapshots = snapshotRepository.findAll();
        for(PrSnapshot snapshot : snapshots) {
            System.out.println(ToStringBuilder.reflectionToString(snapshot, ToStringStyle.MULTI_LINE_STYLE));
        }
    }

}

