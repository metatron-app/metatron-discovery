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

import com.fasterxml.jackson.databind.ObjectMapper;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;

import app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.teddy.DataFrame;

@Service
public class PrepPreviewLineService {
    private static Logger LOGGER = LoggerFactory.getLogger(PrepPreviewLineService.class);

//    @Value("${polaris.dataprep.localBaseDir:#{NULL}}")
//    private String localBaseDir;

    @Autowired(required = false)
    PrepProperties prepProperties;

//    private String fileDatasetUploadLocalPath;

    @Autowired
    PrepDatasetRepository datasetRepository;

    Integer limit;

    PrepPreviewLineService() {
        this.limit = 50;
    }

    private String getPreviewPath() {
        String tempDirPath = prepProperties.getLocalBaseDir();
//        if(null==fileDatasetUploadLocalPath) {
//            if(null!=localBaseDir) {
//                fileDatasetUploadLocalPath = localBaseDir;
//            } else {
//                fileDatasetUploadLocalPath = System.getProperty("user.home");
//                if (true == fileDatasetUploadLocalPath.endsWith(File.separator)) {
//                    fileDatasetUploadLocalPath = fileDatasetUploadLocalPath + "dataprep";
//                } else {
//                    fileDatasetUploadLocalPath = fileDatasetUploadLocalPath + File.separator + "dataprep";
//                }
//            }
//        }
//        tempDirPath = fileDatasetUploadLocalPath;


        if(true==tempDirPath.endsWith(File.separator)) {
            tempDirPath += "previews";
        } else {
            tempDirPath += File.separator + "previews";
        }

        File tempPath = new File(tempDirPath);
        if(!tempPath.exists()){
            tempPath.mkdirs();
        }

        return tempDirPath;
    }

    private String getPreviewPath(String dsId) {
        String tempDirPath = getPreviewPath();
        String pathStr = tempDirPath + File.separator + dsId +".df";

        return pathStr;
    }

    public int putPreviewLines(String dsId, DataFrame gridResponse) {
        int size = 0;
        int limitSize = 2000;

        LOGGER.trace("putPreviewLines(): start");
        PrepDataset dataset = this.datasetRepository.findRealOne(this.datasetRepository.findOne(dsId));
        assert(dataset!=null);

        if(dataset.getDsTypeForEnum()== PrepDataset.DS_TYPE.WRANGLED) {
            limitSize = 100;
        }

        DataFrame previewGrid = new DataFrame();
        previewGrid.colCnt = gridResponse.colCnt;
        previewGrid.colNames = gridResponse.colNames;
        previewGrid.colDescs = gridResponse.colDescs;
        previewGrid.colHists = gridResponse.colHists;
        previewGrid.mapColno = gridResponse.mapColno;
        previewGrid.newColNames           = gridResponse.newColNames          ;
        previewGrid.interestedColNames    = gridResponse.interestedColNames   ;
        previewGrid.dsName = gridResponse.dsName;
        previewGrid.slaveDsNameMap = gridResponse.slaveDsNameMap;
        previewGrid.ruleString = gridResponse.ruleString;
        size = gridResponse.rows.size();
        if(limitSize<size) {
            previewGrid.rows = gridResponse.rows.subList(0, limitSize);
        } else {
            previewGrid.rows = gridResponse.rows;
        }

        String previewPath = getPreviewPath(dsId);
        try {
            ObjectMapper mapper = new ObjectMapper();
            mapper.writeValue(new File(previewPath), previewGrid);
        } catch(Exception e) {
            e.printStackTrace();
            LOGGER.debug(e.getMessage());
            throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, e);
        }
        dataset.putCustomValue("previewPath", getPreviewPath());

        LOGGER.trace("putPreviewLines(): end");
        return size;
    }

}

