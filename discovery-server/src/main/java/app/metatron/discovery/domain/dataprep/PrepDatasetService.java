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

import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import app.metatron.discovery.domain.datasource.connection.DataConnection;
import app.metatron.discovery.domain.datasource.connection.DataConnectionRepository;


@Service
@Transactional
public class PrepDatasetService {
    @Autowired
    PrepDatasetRepository datasetRepository;

    @Autowired
    DataConnectionRepository dataConnectionRepository;


    public void setTotalLines(String dsId, Integer totalLines) {
        PrepDataset dataset = this.datasetRepository.findOne(dsId);
        dataset.setTotalLines(totalLines);
    }

    public String extendDsName(PrepDataset dataset) {
        String dsName = dataset.getDsName();
        if(dataset.getImportTypeEnum().equals(PrepDataset.IMPORT_TYPE.FILE)) {
            String extensionType = FilenameUtils.getExtension(dataset.getFilename());
            if(extensionType.equalsIgnoreCase("csv")) {
                dsName = dsName + " (CSV)";
            } else if(extensionType.toUpperCase().startsWith("XLS")) {
                dsName = dsName + " (EXCEL)";
            } else {
                dsName = dsName + " ("+extensionType.toLowerCase()+")";
            }
        } else {
            if(dataset.getImportTypeEnum()== PrepDataset.IMPORT_TYPE.HIVE) {
                dsName = dsName +" (HIVE)";
            } else {
                DataConnection dc = dataConnectionRepository.findOne(dataset.getDcId());
                assert (dc != null);

                dsName = dsName +" ("+dc.getImplementor()+")";
            }
        }
        return dsName;
    }
}
