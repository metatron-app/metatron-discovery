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

import app.metatron.discovery.domain.dataprep.teddy.DataFrame;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.core.annotation.*;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import java.io.File;

@RepositoryEventHandler(PrepDataset.class)
public class PrepDatasetEventHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(PrepDatasetEventHandler.class);

    @Autowired
    PrepDatasetRepository datasetRepository;

    @Autowired
    PrepDatasetService datasetService;

    @Autowired
    PrepPreviewLineService previewLineService;

    @Autowired
    private PrepHdfsService hdfsService;

    @Autowired(required = false)
    private PrepDatasetFileService datasetFilePreviewService;

    @Autowired(required = false)
    private PrepDatasetSparkHiveService datasetSparkHivePreviewService;

    @Autowired(required = false)
    private PrepDatasetJdbcService datasetJdbcPreviewService;

    @HandleBeforeCreate
    public void beforeCreate(PrepDataset dataset) {
        LOGGER.debug(dataset.toString());
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

            PrepDataset.IMPORT_TYPE importType = dataset.getImportTypeEnum();
            if(importType == PrepDataset.IMPORT_TYPE.FILE) {
                String filekey = dataset.getFilekey();
                String sheetName = dataset.getSheetName();
                String delimiter = dataset.getDelimiter();
                if (filekey != null) {
                    if(true==dataset.isEXCEL()) {
                        String csvFileName = this.datasetFilePreviewService.moveExcelToCsv(filekey,sheetName,delimiter);
                        dataset.putCustomValue("fileType", "DSV");
                        dataset.putCustomValue("filePath", csvFileName);
                        int lastIdx = csvFileName.lastIndexOf(File.separator);
                        String newFileKey = csvFileName.substring(lastIdx+1);
                        dataset.setFilekey(newFileKey);
                        filekey = newFileKey;
                    }
                    DataFrame dataFrame = this.datasetFilePreviewService.getPreviewLinesFromFileForDataFrame(dataset, filekey, "0", "2000");
                    int size = this.previewLineService.putPreviewLines(dataset.getDsId(), dataFrame);

                    if( false==dataset.getCustomValue("filePath").toLowerCase().startsWith("hdfs://") ) {
                        String localFilePath = dataset.getCustomValue("filePath"); // this.datasetFilePreviewService.getPath2(dataset);
                        if(null!=localFilePath) {
                            String hdfsFilePath = this.hdfsService.moveLocalToHdfs(localFilePath, filekey);
                            if (null!=hdfsFilePath) {
                                dataset.putCustomValue("filePath", hdfsFilePath);
                            }
                        }
                    }
                }
            } else if(importType == PrepDataset.IMPORT_TYPE.HIVE) {
                this.datasetSparkHivePreviewService.setoAuthToekn(oAuthToken);
                DataFrame dataFrame = this.datasetSparkHivePreviewService.getPreviewLinesFromStagedbForDataFrame(dataset, "50");
                this.previewLineService.putPreviewLines(dataset.getDsId(), dataFrame);
            } else if(importType == PrepDataset.IMPORT_TYPE.DB) {
                this.datasetJdbcPreviewService.setoAuthToekn(oAuthToken);
                DataFrame dataFrame = this.datasetJdbcPreviewService.getPreviewLinesFromJdbcForDataFrame(dataset, "50");
                this.previewLineService.putPreviewLines(dataset.getDsId(), dataFrame);
            }
        } catch (Exception e) {
            LOGGER.debug(e.getMessage());
        }
        this.datasetRepository.flush();
    }

    @HandleBeforeSave
    public void beforeSave(PrepDataset dataset) {
        LOGGER.debug(dataset.toString());
    }

    @HandleAfterSave
    public void afterSave(PrepDataset dataset) {
        LOGGER.debug(dataset.toString());
    }
}
