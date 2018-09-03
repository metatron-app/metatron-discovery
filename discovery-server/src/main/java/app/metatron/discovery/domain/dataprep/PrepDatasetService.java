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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;


@Service
@Transactional
public class PrepDatasetService {
    @Autowired
    PrepPreviewLineService previewLineService;

    @Autowired
    private PrepHdfsService hdfsService;

    @Autowired
    private PrepDatasetFileService datasetFilePreviewService;

    @Autowired
    private PrepDatasetSparkHiveService datasetSparkHivePreviewService;

    @Autowired
    private PrepDatasetJdbcService datasetJdbcPreviewService;

    // not using
    /*
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
    */

    private String filePreviewSize = "2000";
    private String hivePreviewSize = "50";
    private String jdbcPreviewSize = "50";

    public void savePreview(PrepDataset dataset, String oAuthToken) throws Exception {
        DataFrame dataFrame = null;

        PrepDataset.IMPORT_TYPE importType = dataset.getImportTypeEnum();
        if(importType == PrepDataset.IMPORT_TYPE.FILE) {
            dataFrame = subFileType(dataset);
        } else if(importType == PrepDataset.IMPORT_TYPE.HIVE) {
            this.datasetSparkHivePreviewService.setoAuthToekn(oAuthToken);
            dataFrame = this.datasetSparkHivePreviewService.getPreviewLinesFromStagedbForDataFrame(dataset, this.hivePreviewSize);
        } else if(importType == PrepDataset.IMPORT_TYPE.DB) {
            this.datasetJdbcPreviewService.setoAuthToekn(oAuthToken);
            dataFrame = this.datasetJdbcPreviewService.getPreviewLinesFromJdbcForDataFrame(dataset, this.jdbcPreviewSize);
        }

        if(dataFrame!=null) {
            int size = this.previewLineService.putPreviewLines(dataset.getDsId(), dataFrame);
        }
    }

    public DataFrame subFileType(PrepDataset dataset) throws Exception {
        DataFrame dataFrame = null;

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

            dataFrame = this.datasetFilePreviewService.getPreviewLinesFromFileForDataFrame(dataset, filekey, "0", this.filePreviewSize);

            dataset.setFileType(PrepDataset.FILE_TYPE.LOCAL);
            if( false==dataset.getCustomValue("filePath").toLowerCase().startsWith("hdfs://") ) { // always
                String localFilePath = dataset.getCustomValue("filePath");
                String hdfsFilePath = this.hdfsService.moveLocalToHdfs(localFilePath, filekey);
                if (null!=hdfsFilePath) {
                    dataset.putCustomValue("filePath", hdfsFilePath);
                    dataset.setFileType(PrepDataset.FILE_TYPE.HDFS);
                }
            }
        }

        return dataFrame;
    }
}
