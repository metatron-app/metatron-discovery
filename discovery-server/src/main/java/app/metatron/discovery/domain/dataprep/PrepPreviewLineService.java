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
import app.metatron.discovery.domain.dataprep.entity.PrDataset;
import app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.repository.PrDatasetRepository;
import app.metatron.discovery.domain.dataprep.service.PrDatasetService;
import app.metatron.discovery.domain.dataprep.teddy.ColumnDescription;
import app.metatron.discovery.domain.dataprep.teddy.ColumnType;
import app.metatron.discovery.domain.dataprep.teddy.DataFrame;
import app.metatron.discovery.domain.dataprep.teddy.Row;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;
import app.metatron.discovery.domain.dataprep.transform.PrepTransformResponse;
import app.metatron.discovery.domain.dataprep.transform.PrepTransformService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Lists;

import java.io.File;
import java.io.IOException;
import java.sql.SQLException;
import java.util.LinkedHashMap;
import java.util.List;

import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PrepPreviewLineService {
    private static Logger LOGGER = LoggerFactory.getLogger(PrepPreviewLineService.class);

    @Autowired(required = false)
    PrepProperties prepProperties;

    @Autowired
    PrDatasetRepository datasetRepository;

    @Autowired
    PrDatasetService datasetService;

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
        PrDataset dataset = this.datasetRepository.findRealOne(this.datasetRepository.findOne(dsId));
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

        LOGGER.trace("putPreviewLines(): end");
        return size;
    }

    public DataFrame getPreviewLines(String dsId) {
        DataFrame dataFrame;

        try {
            PrDataset dataset = this.datasetRepository.findRealOne(this.datasetRepository.findOne(dsId));
            assert (dataset != null);

            ObjectMapper mapper = GlobalObjectMapper.getDefaultMapper();
            String filepath = getPreviewPath() + File.separator + dataset.getDsId() + ".df";
            File theFile = new File(filepath);
            if (true == theFile.exists()) {
                dataFrame = mapper.readValue(theFile, DataFrame.class);
            } else {
                dataFrame = this.remakePreviewLines(dsId);
            }
            assert dataFrame != null;

            for (Row row : dataFrame.rows) {
                for (int i = 0; i < dataFrame.getColCnt(); i++) {
                    Object obj = row.get(i);
                    if (obj instanceof Integer) {
                        row.objCols.set(i, ((Integer) obj).longValue());
                    } else if (obj instanceof Float) {
                        row.objCols.set(i, ((Float) obj).doubleValue());
                    }
                }
            }

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

        } catch (TeddyException e) {
            e.printStackTrace();
            throw PrepException.fromTeddyException(e);
        } catch (SQLException | IOException e) {
            LOGGER.error(e.getMessage());
            throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, e);
        }

        return dataFrame;
    }

    public DataFrame remakePreviewLines(String dsId) throws IOException, SQLException, TeddyException {
        DataFrame dataFrame = null;

        PrDataset dataset = this.datasetRepository.findRealOne(this.datasetRepository.findOne(dsId));
        assert(dataset!=null);

        switch (dataset.getDsType()) {
            case IMPORTED:
                dataFrame = this.datasetService.getImportedPreview(dataset);
                break;
            case WRANGLED:
                PrepTransformResponse transformResponse = this.transformService.fetch(dsId, null);
                dataFrame = transformResponse.getGridResponse();
                break;
        }
        assert dataFrame != null;

        putPreviewLines(dsId, dataFrame);

        return dataFrame;
    }
}

