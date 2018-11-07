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

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey;
import app.metatron.discovery.domain.dataprep.teddy.ColumnDescription;
import app.metatron.discovery.domain.dataprep.teddy.ColumnType;
import app.metatron.discovery.domain.dataprep.teddy.DataFrame;
import app.metatron.discovery.domain.dataprep.teddy.Row;
import app.metatron.discovery.domain.dataprep.transform.PrepTransformResponse;
import app.metatron.discovery.domain.dataprep.transform.PrepTransformService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class PrepPreviewLineService {
    private static Logger LOGGER = LoggerFactory.getLogger(PrepPreviewLineService.class);

    @Autowired(required = false)
    PrepProperties prepProperties;

    @Autowired
    PrepDatasetRepository datasetRepository;

    @Autowired
    PrepDatasetService datasetService;

    @Autowired
    PrepTransformService transformService;

    Integer limit;

    PrepPreviewLineService() {
        this.limit = 200;
    }

    private String getPreviewPath() {
        String tempDirPath = prepProperties.getLocalBaseDir() + File.separator + PrepProperties.dirPreview;

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

        LOGGER.trace("putPreviewLines(): start");
        PrepDataset dataset = this.datasetRepository.findRealOne(this.datasetRepository.findOne(dsId));
        assert(dataset!=null);

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
        if(this.limit<size) {
            previewGrid.rows = gridResponse.rows.subList(0, this.limit);
        } else {
            previewGrid.rows = gridResponse.rows;
        }

        String previewPath = getPreviewPath(dsId);
        try {
            ObjectMapper mapper = GlobalObjectMapper.getDefaultMapper();
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

    public DataFrame getPreviewLines(String dsId) {
        DataFrame dataFrame = null;

        try {
            PrepDataset dataset = this.datasetRepository.findRealOne(this.datasetRepository.findOne(dsId));
            assert(dataset!=null);

            String previewPathKey = "previewPath";
            String previewPath = dataset.getCustomValue(previewPathKey);
            if (null != previewPath) {
                ObjectMapper mapper = GlobalObjectMapper.getDefaultMapper();
                String filepath = previewPath + File.separator + dataset.getDsId() + ".df";
                File theFile = new File(filepath);
                if (true == theFile.exists()) {
                    dataFrame = mapper.readValue(theFile, DataFrame.class);
                } else {
                    dataFrame = this.remakePreviewLines(dsId);
                    // regenerate
                    // throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_FILE_NOT_FOUND, filepath);
                }
            } else {
                throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_PROPERTY_NOT_AVAILABLE, previewPathKey+"==(null)");
            }

            if(dataFrame!=null) {
                List<ColumnDescription> columnDescs = dataFrame.colDescs;
                List<Integer> colNos = Lists.newArrayList();
                int colIdx = 0;
                for (ColumnDescription columnDesc : columnDescs) {
                    if (columnDesc.getType().equals(ColumnType.TIMESTAMP)) {
                        colNos.add(colIdx);
                    }
                    colIdx++;
                }

                if (0 < colNos.size()) {
                    for (Row row : dataFrame.rows) {
                        for (Integer colNo : colNos) {
                            Object jodaTime = row.get(colNo);
                            if (jodaTime instanceof LinkedHashMap) {
                                LinkedHashMap mapTime = (LinkedHashMap) jodaTime;
                                DateTime dateTime = new DateTime(Long.parseLong(mapTime.get("millis").toString()));
                                row.objCols.set(colNo, dateTime);
                            }
                        }
                    }
                }
            } else {
                throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_PREVIEWLINES_CRASHED, "get preview==(null)");
            }
        } catch (Exception e) {
            LOGGER.debug(e.getMessage());
            throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, e);
        }

        return dataFrame;
    }

    public Map<String,Object> ready_to_preview(String dsId) {
        Map<String,Object> response = Maps.newHashMap();

        boolean remake = false;
        DataFrame dataFrame = null;
        try {
            dataFrame = this.getPreviewLines(dsId);
        } catch(PrepException e) {
            if( e.getMessageKey().equals(PrepMessageKey.MSG_DP_ALERT_FILE_NOT_FOUND)
                || e.getMessageKey().equals(PrepMessageKey.MSG_DP_ALERT_PREVIEWLINES_CRASHED) ) {
                remake = true;
            } else {
                LOGGER.debug(e.getMessage());
                throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, e);
            }
        } catch(Exception e) {
            LOGGER.debug(e.getMessage());
            throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, e);
        }

        try {
            if (true == remake) {
                dataFrame = this.remakePreviewLines(dsId);
                if (null != dataFrame) {
                    int size = this.putPreviewLines(dsId, dataFrame);
                } else {
                    throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_PREVIEWLINES_CRASHED, "remake preview==(null)");
                }
            }
        } catch(Exception e) {
            LOGGER.debug(e.getMessage());
            throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, e);
        }

        response.put("gridResponse", dataFrame);

        return response;
    }

    public DataFrame remakePreviewLines(String dsId) {
        DataFrame dataFrame = null;

        try {
            PrepDataset dataset = this.datasetRepository.findRealOne(this.datasetRepository.findOne(dsId));
            assert(dataset!=null);

            if(dataset.getDsTypeForEnum()== PrepDataset.DS_TYPE.IMPORTED) {
                dataFrame = this.datasetService.getImportedPreview(dataset);
                if(null==dataFrame) {
                    throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_PREVIEWLINES_CRASHED, "get Imported preview==(null)");
                }
            } else if(dataset.getDsTypeForEnum()== PrepDataset.DS_TYPE.WRANGLED) {
                PrepTransformResponse transformResponse = this.transformService.fetch(dsId, null);
                dataFrame = transformResponse.getGridResponse();
                if(null==dataFrame) {
                    throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_PREVIEWLINES_CRASHED, "get Wrangled preview==(null)");
                }
            } else {
                // not reachable
            }

            if(dataFrame!=null) {
                int size = putPreviewLines(dsId, dataFrame);
            } else {
                LOGGER.debug(dsId + " dataframe is null");
                throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_PREVIEWLINES_CRASHED, "no dataframe of preview");
            }
        } catch(Exception e) {
            LOGGER.debug(e.getMessage());
            throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, e);
        }

        return dataFrame;
    }
}

