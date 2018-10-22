package app.metatron.discovery.domain.dataprep;

import app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.teddy.ColumnDescription;
import app.metatron.discovery.domain.dataprep.teddy.ColumnType;
import app.metatron.discovery.domain.dataprep.teddy.DataFrame;
import app.metatron.discovery.domain.dataprep.teddy.Row;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Lists;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.persistence.PostLoad;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.util.LinkedHashMap;
import java.util.List;

public class PrepDatasetListner {
    private static Logger LOGGER = LoggerFactory.getLogger(PrepDatasetController.class);

    @Autowired
    PrepDatasetService datasetService;

    @PostLoad
    public void postLoad(Object entity) throws PrepException {
        PrepDataset dataset = (PrepDataset) entity;
        getGridResponse(dataset);
    }

    public void getGridResponse(PrepDataset dataset) {
        DataFrame dataFrame = dataset.getGridResponse();

        if (null == dataFrame) {
            try {
                String previewPath = dataset.getCustomValue("previewPath");
                if (null != previewPath) {
                    ObjectMapper mapper = new ObjectMapper();
                    File theFile = new File(previewPath + File.separator + dataset.getDsId() + ".df");
                    if (true == theFile.exists()) {
                        dataFrame = mapper.readValue(theFile, DataFrame.class);
                    } else {
                        if(dataset.getDsTypeForEnum()== PrepDataset.DS_TYPE.IMPORTED) {
                            if(this.datasetService==null) {
                                PrepAutowireHelper.autowire(this, this.datasetService);
                            }

                            dataFrame = this.datasetService.getPreviewImportedDataset(dataset);
                            if(null!=dataFrame) {
                                HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
                                String oAuthToken = "bearer ";
                                Cookie[] cookies = request.getCookies();
                                for (int i = 0; i < cookies.length; i++) {
                                    if (cookies[i].getName().equals("LOGIN_TOKEN"))
                                        oAuthToken = oAuthToken + cookies[i].getValue();
                                }
                                this.datasetService.savePreview(dataset, oAuthToken);
                            }
                        } else {
                            dataFrame = new DataFrame(dataset.getDsName());
                            Row row = new Row();
                            row.add("Preview is missing", new String("Try to edit some rules of this dataset. preview will be made soon."));
                            dataFrame.addColumn("error", ColumnType.STRING);
                            dataFrame.addColumn("solution", ColumnType.STRING);
                            dataFrame.rows.add(row);
                        }
                    }
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
                                    try {
                                        LinkedHashMap mapTime = (LinkedHashMap) jodaTime;
                                        DateTime dateTime = new DateTime(Long.parseLong(mapTime.get("millis").toString()));
                                        row.objCols.set(colNo, dateTime);
                                    } catch (Exception e) {
                                        LOGGER.debug(e.getMessage());
                                    }
                                }
                            }
                        }
                    }
                }
                dataset.setDataFrame(dataFrame);
            } catch (Exception e) {
                LOGGER.debug(e.getMessage());
                throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, e);
            }
        }
    }
}
