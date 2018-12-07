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

import app.metatron.discovery.domain.dataprep.PrepDatasetSparkHiveService;
import app.metatron.discovery.domain.dataprep.PrepHdfsService;
import app.metatron.discovery.domain.dataprep.csv.PrepCsvParseResult;
import app.metatron.discovery.domain.dataprep.csv.PrepCsvUtil;
import app.metatron.discovery.domain.dataprep.entity.PrSnapshot;
import app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey;
import app.metatron.discovery.domain.dataprep.repository.PrDataflowRepository;
import app.metatron.discovery.domain.dataprep.repository.PrDatasetRepository;
import app.metatron.discovery.domain.dataprep.repository.PrSnapshotRepository;
import app.metatron.discovery.domain.dataprep.teddy.DataFrame;
import com.google.common.collect.Maps;
import org.apache.http.HttpStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RequestMapping(value = "/preparationsnapshots")
@RepositoryRestController
public class PrSnapshotController {

    private static Logger LOGGER = LoggerFactory.getLogger(PrSnapshotController.class);

    @Autowired
    private PrDatasetRepository datasetRepository;

    @Autowired
    private PrDataflowRepository dataflowRepository;

    @Autowired
    private PrSnapshotRepository snapshotRepository;

    @Autowired
    private PrSnapshotService snapshotService;

    @Autowired
    private PrepHdfsService hdfsService;

    @Autowired(required = false)
    private PrepDatasetSparkHiveService datasetSparkHivePreviewService;

    @RequestMapping(value="/check_table/{schema}/{table}",method = RequestMethod.GET)
    public @ResponseBody
    ResponseEntity<?> checkHiveTable(
            @PathVariable("schema") String schema,
            @PathVariable("table") String table
    ) {
        Map<String,Object> responseMap = new HashMap<String,Object>();
        try {
            responseMap.put("isExist",false);
        } catch (Exception e) {
            LOGGER.error("checkHiveTable(): caught an exception: ", e);
            throw PrepException.create(PrepErrorCodes.PREP_DATAFLOW_ERROR_CODE, e);
        }

        return ResponseEntity.status(HttpStatus.SC_OK).body(responseMap);
    }

    @RequestMapping(value="/{ssId}/contents",method = RequestMethod.GET)
    public @ResponseBody
    ResponseEntity<?> getContents(
            @PathVariable("ssId") String ssId,
            @RequestParam(value = "offset", required = false, defaultValue = "0") Integer offset,
            @RequestParam(value = "target", required = false, defaultValue = "1") Integer target
    ) {
        Map<String,Object> responseMap = new HashMap<String,Object>();
        try {
            PrSnapshot snapshot = this.snapshotRepository.findOne(ssId);
            if(snapshot!=null) {
                DataFrame gridResponse = new DataFrame();

                PrSnapshot.SS_TYPE ss_type = snapshot.getSsType();
                if( PrSnapshot.SS_TYPE.URI==ss_type ) {
                    String storedUri = snapshot.getStoredUri();

                    // We generated JSON snapshots to have ".json" at the end of the URI.
                    if (storedUri.endsWith(".json")) {
                        String errorMsg = "getContents(): file not supported: JSON";
                        throw PrepException.create(PrepErrorCodes.PREP_SNAPSHOT_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_PREP_FILE_TYPE_NOT_SUPPORTED, errorMsg);
                    } else {
                        String snapshotDisplayUri = snapshot.getStoredUri();
                        if(null==snapshotDisplayUri) {
                            String errorMsg = "["+ ssId + "] isn't a saved snapshot.";
                            throw PrepException.create(PrepErrorCodes.PREP_SNAPSHOT_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_SNAPSHOT_NOT_SAVED, errorMsg);
                        }
//                        String snapshotUri = this.snapshotService.escapeSsNameOfUri(snapshotDisplayUri);
//                        String filePath = null;
//                        String realUri = null;

//                        if( PrSnapshot.SS_TYPE.HDFS==ss_type ) {
//                            filePath = snapshotUri;
//                            realUri = snapshotUri;
//                        } else if( PrSnapshot.SS_TYPE.FILE==ss_type ) {
//                            File dir = new File(snapshotUri);
//                            File[] files = dir.listFiles();
//                            for (int i = 0; i < files.length; i++) {
//                                File file = files[i];
//                                if (file.isFile() == false) {
//                                    continue;
//                                }
//                                if(file.getName().startsWith("part-00000-")) {
//                                    filePath = file.getAbsolutePath();
//                                    break;
//                                }
//                            }
//                            realUri = "file://" + filePath;
//                        }

//                        List<String[]> grid = Util.loadGridLocalCsv(filePath, ",", target, this.hdfsService.getConf(), colNames);
                        //List<String[]> grid = Util.loadCsvFileLocal(dirPath, ",", target, colNames);
//                        gridResponse.setByGrid(grid, colNames);
                        PrepCsvParseResult result = PrepCsvUtil.parse(snapshot.getStoredUri(), ",", 10000, this.hdfsService.getConf(), true);
                        gridResponse.setByGrid(result);
                        responseMap.put("offset", gridResponse.rows.size());
                        responseMap.put("size", gridResponse.rows.size());
                        responseMap.put("gridResponse", gridResponse);
                    }
                } else if( PrSnapshot.SS_TYPE.STAGING_DB==ss_type ) {
                    String dbName = snapshot.getDbName();
                    String tblName = snapshot.getTblName();
                    String sql = "SELECT * FROM "+dbName+"."+tblName;
                    Integer size = offset+target;
                    gridResponse = datasetSparkHivePreviewService.getPreviewStagedbForDataFrame(sql,dbName,tblName,String.valueOf(size));
                    if(null==gridResponse) {
                        gridResponse = new DataFrame();
                    } else {
                        int rowSize = gridResponse.rows.size();
                        int lastIdx = offset + target -1;
                        if(0<=lastIdx && offset<rowSize) {
                            if(rowSize<=lastIdx) {
                                lastIdx = rowSize;
                            }
                            gridResponse.rows = gridResponse.rows.subList(offset,lastIdx);
                        } else {
                            gridResponse.rows.clear();
                        }
                    }
                    Integer gridRowSize = gridResponse.rows.size();
                    responseMap.put("offset", offset+gridRowSize);
                    responseMap.put("size", gridRowSize);
                    responseMap.put("gridResponse", gridResponse);
                }

                // We put the info below as attributes of the entity
//                Map<String,Object> originDs = Maps.newHashMap();
//                String dsName = snapshot.getOrigDsInfo("dsName");
//                String queryStmt = snapshot.getOrigDsInfo("queryStmt");
//                String filePath = snapshot.getOrigDsInfo("filePath");
//                String createdTime = snapshot.getOrigDsInfo("createdTime");
//                originDs.put("dsName",dsName);
//                originDs.put("qryStmt",queryStmt);
//                originDs.put("filePath",filePath);
//                originDs.put("createdTime",createdTime);
//                responseMap.put("originDsInfo", originDs);
            } else {
                String errorMsg = "snapshot["+ssId+"] does not exist";
                throw PrepException.create(PrepErrorCodes.PREP_SNAPSHOT_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_NO_SNAPSHOT, errorMsg);
            }
        } catch (Exception e) {
            LOGGER.error("getContents(): caught an exception: ", e);
            throw PrepException.create(PrepErrorCodes.PREP_SNAPSHOT_ERROR_CODE, e);
        }

        return ResponseEntity.status(HttpStatus.SC_OK).body(responseMap);
    }

    @RequestMapping(value="/{ssId}/download",method = RequestMethod.GET)
    public @ResponseBody
    ResponseEntity<?> getDownload(
            HttpServletRequest request,
            HttpServletResponse response,
            @PathVariable("ssId") String ssId
    ) {
        try {
            String downloadFileName = ssId + ".csv";
            response.setHeader("Content-Disposition", String.format("attachment; filename=\"%s\"", downloadFileName));
            this.snapshotService.downloadSnapshotFile(ssId, response);
        } catch (Exception e) {
            LOGGER.error("getDownload(): caught an exception: ", e);
            throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, e);
        }

        return null;
    }

    @RequestMapping(value="/{dsId}/work_list",method = RequestMethod.GET)
    public @ResponseBody
    ResponseEntity<?> workList(
            @PathVariable("dsId") String dsId,
            @RequestParam(value = "option", required = false, defaultValue = "0") String option) {
        Map<String, Object> response = Maps.newHashMap();
        try {
            List<PrSnapshot> snapshots = this.snapshotService.getWorkList(dsId, option);
            response.put("snapshots",snapshots);
        } catch (Exception e) {
            LOGGER.error("workList(): caught an exception: ", e);
            throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE,e);
        }
        return ResponseEntity.ok(response);
    }
}

