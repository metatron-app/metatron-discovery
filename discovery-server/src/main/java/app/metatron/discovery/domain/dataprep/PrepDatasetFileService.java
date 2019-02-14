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


import app.metatron.discovery.common.datasource.DataType;
import app.metatron.discovery.domain.dataprep.csv.PrepCsvUtil;
import app.metatron.discovery.domain.dataprep.entity.PrDataset;
import app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey;
import app.metatron.discovery.domain.dataprep.json.PrepJsonUtil;
import app.metatron.discovery.domain.dataprep.teddy.ColumnType;
import app.metatron.discovery.domain.dataprep.teddy.DataFrame;
import app.metatron.discovery.domain.dataprep.teddy.DataFrameService;
import app.metatron.discovery.domain.dataprep.teddy.Util;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;
import app.metatron.discovery.domain.dataprep.transform.TeddyImpl;
import app.metatron.discovery.domain.dataprep.transform.TimestampTemplate;
import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.util.ExcelProcessor;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.monitorjbl.xlsx.StreamingReader;
import org.apache.commons.io.FilenameUtils;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.ContentSummary;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.joda.time.DateTime;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;
import java.nio.channels.FileLock;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.Future;

@Service
public class PrepDatasetFileService {
    private static Logger LOGGER = LoggerFactory.getLogger(PrepDatasetFileService.class);

    @Autowired(required = false)
    PrepProperties prepProperties;

    @Autowired
    PrepHdfsService hdfsService;

    @Autowired
    TeddyImpl teddyImpl;

    @Autowired
    DataFrameService dataFrameService;

    Map<String, Future<Map<String,Object>>> futures = null;

    public PrepDatasetFileService() {
    }

    private String fileDatasetUploadLocalPath=null;

    private String prefixColumnName = "column";

    private String getPathLocal(String fileKey) {
        String pathStr;
        if(true==fileKey.contains(File.separator)) {
            pathStr = fileKey;
        } else {
            if(null==fileDatasetUploadLocalPath) {
                fileDatasetUploadLocalPath = prepProperties.getLocalBaseDir() + File.separator + PrepProperties.dirUpload;
            }

            File tempPath = new File(fileDatasetUploadLocalPath);
            if(!tempPath.exists()){
                tempPath.mkdirs();
            }

            if(true==fileDatasetUploadLocalPath.endsWith(File.separator)) {
                pathStr = fileDatasetUploadLocalPath + fileKey;
            } else {
                pathStr = fileDatasetUploadLocalPath + File.separator + fileKey;
            }
        }
        return pathStr;
    }

    private ColumnType getTypeFormString(String str) {
        //Boolean Check
        try {
            if (str.equalsIgnoreCase("true") || str.equalsIgnoreCase("false")) {
                return ColumnType.BOOLEAN;
            }
        } catch (Exception e) {
            //LOGGER.info("create(): Detecting Column Type...", e);
        }

        //Long Check
        try {
            Long.parseLong(str);
            return ColumnType.LONG;
        } catch (Exception e) {
            //LOGGER.info("create(): Detecting Column Type...", e);
        }

        //Number Check
        try {
            Double.parseDouble(str);
            return ColumnType.DOUBLE;
        } catch (Exception e) {
            //LOGGER.info("create(): Detecting Column Type...", e);
        }

        //Timestamp Check
        for (TimestampTemplate tt : TimestampTemplate.values()) {
            try {
                DateTimeFormatter dtf = DateTimeFormat.forPattern(tt.getFormat()).withLocale(Locale.ENGLISH);
                DateTime.parse(str, dtf);
                return ColumnType.TIMESTAMP;
            } catch (Exception e) {
                //LOGGER.info("create(): Detecting Column Type...", e);
            }
        }

        return ColumnType.STRING;
    }

    private Field makeFieldFromCSV(int idx, String fieldKey, ColumnType columnType){
        DataType fieldType;
        Field.FieldRole fieldBIType;

        switch (columnType) {
            case BOOLEAN:
                fieldType = DataType.BOOLEAN;
                fieldBIType = Field.FieldRole.DIMENSION;
                return new Field(fieldKey, fieldType, fieldBIType, idx+1);
            case LONG:
            case DOUBLE:
                fieldType = DataType.DOUBLE;
                fieldBIType = Field.FieldRole.MEASURE;
                return new Field(fieldKey, fieldType, fieldBIType, idx+1);
            case TIMESTAMP:
                fieldType = DataType.TIMESTAMP;
                fieldBIType = Field.FieldRole.TIMESTAMP;
                return new Field(fieldKey, fieldType, fieldBIType, idx+1);
            default:
                fieldType = DataType.TEXT;
                fieldBIType = Field.FieldRole.DIMENSION;
                return new Field(fieldKey, fieldType, fieldBIType, idx+1);
        }
    }

    private List<String[]> getGridFromExcel(Sheet sheet, int limitRows) {
        List<String[]> grid = Lists.newArrayList();

        for (Row r : sheet) {
            List<String> row = Lists.newArrayList();

            int not_emtpy=0;

            if(r==null) {
                continue;
            }
            if(limitRows<=r.getRowNum()) { break; }

            for (Cell c : r) {
                if(c==null) {
                    row.add(null);
                    continue;
                }

                String strCellValue = null;
                Object cellValue = ExcelProcessor.getCellValue(c);
                if(cellValue!=null) {
                    strCellValue = String.valueOf(cellValue);
                    if(false==strCellValue.isEmpty()) {
                        not_emtpy++;
                    }
                }
                row.add(strCellValue);
            }

            if(0<not_emtpy) {
                grid.add(row.toArray(new String[row.size()]));
                if (grid.size() >= limitRows) {
                    break;
                }
            }
        }

        return grid;
    }

    private Map<String, Object> getResponseMapFromExcel(File theFile, String extensionType, int limitRows, boolean autoTyping) throws IOException, TeddyException {
        Map<String, Object> responseMap = Maps.newHashMap();
        List<String> sheetNames = Lists.newArrayList();
        List<DataFrame> gridResponses = Lists.newArrayList();
        Workbook workbook;

        if ("xls".equals(extensionType)) {       // 97~2003
            workbook = new HSSFWorkbook(new FileInputStream(theFile));
        } else {   // 2007 ~
            InputStream is = new FileInputStream(theFile);
            workbook = StreamingReader.builder()
                    .rowCacheSize(100)
                    .bufferSize(4096)
                    .open(is);
        }

        if (null == workbook) {
            responseMap.put("sheetNames", sheetNames);
            responseMap.put("gridResponses", gridResponses);
            return responseMap;
        }

        for (Sheet sheet : workbook) {
            DataFrame df = new DataFrame(sheet.getSheetName());
            df.setByGrid(getGridFromExcel(sheet, limitRows), null);

            if (autoTyping) {
                df = teddyImpl.applyAutoTyping(df);
            }

            sheetNames.add(sheet.getSheetName());
            gridResponses.add(df);
        }

        responseMap.put("sheetNames", sheetNames);
        responseMap.put("gridResponses", gridResponses);
        return responseMap;
    }

    private Map<String, Object> getResponseMapFromJson(String storedUri, int limitRows, boolean autoTyping) throws TeddyException {
        Map<String, Object> responseMap = Maps.newHashMap();
        List<DataFrame> gridResponses = Lists.newArrayList();

        DataFrame df = new DataFrame("df_for_preview");
        df.setByGridWithJson(PrepJsonUtil.parseJSON(storedUri, ",", limitRows, hdfsService.getConf()));

        if (autoTyping) {
            df = teddyImpl.applyAutoTyping(df);
        }

        gridResponses.add(df);

        responseMap.put("gridResponses", gridResponses);
        return responseMap;
    }

    private Map<String, Object> getResponseMapFromCsv(String storedUri, int limitRows, String delimiterCol, boolean autoTyping) throws TeddyException {
        Map<String, Object> responseMap = Maps.newHashMap();
        List<DataFrame> gridResponses = Lists.newArrayList();

        DataFrame df = new DataFrame("df_for_preview");
        df.setByGrid(PrepCsvUtil.parse(storedUri, delimiterCol, limitRows, hdfsService.getConf()));

        if (autoTyping) {
            df = teddyImpl.applyAutoTyping(df);
        }

        gridResponses.add(df);

        responseMap.put("gridResponses", gridResponses);
        return responseMap;
    }

//    public DataFrame applyAutoTyping(DataFrame df) throws TeddyException {
//        if (!prepProperties.isAutoTypingEnabled()) {
//            return df;
//        }
//
//        List<String> ruleStrings = teddyImpl.getAutoTypingRules(df);
//        for (String ruleString : ruleStrings) {
//            df = dataFrameService.applyRule(df, ruleString);
//        }
//
//        return df;
//    }

    /*
     * Response contains:
     *   success    FIXME: do not use   -> 200 or 500
     *   message    FIXME: do not use   -> error message in the exception
     *   sheets     List<String> sheet names    (Excel only)
     *   grid[]
     *     headers  FIXME: do not use   -> empty[] (CSV, Excel) or null (JSON)
     *     field[]  FIXME: only name & type is needed
     *       column name
     *       column type
     *       is dimension?
     *       column#
     *     data     List<Map<String, String>
     *     totalRows    FIXME: is this needed?
     *     sheetName    (Excel only)
     *   totalBytes     FIXME: is this needed?
     */
    public Map<String, Object> fileCheckSheet3(String storedUri, String size, String delimiterCol, boolean autoTyping) {

        Map<String, Object> responseMap;
        String extensionType = FilenameUtils.getExtension(storedUri);
        int limitRows = Integer.parseInt(size);

        try {
            File theFile = new File(new URI(storedUri));
            if(false==theFile.exists()) {
                throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_FILE_NOT_FOUND, "No file : " + storedUri);
            }

            switch (extensionType) {
                case "xlsx":
                case "xls":
                    responseMap = getResponseMapFromExcel(theFile, extensionType, limitRows, autoTyping);
                    break;
                case "json":
                    responseMap = getResponseMapFromJson(storedUri, limitRows, autoTyping);
                    break;
                default:
                    responseMap = getResponseMapFromCsv(storedUri, limitRows, delimiterCol, autoTyping);
            }
        } catch (URISyntaxException e) {
            e.printStackTrace();
            throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_MALFORMED_URI_SYNTAX, storedUri);
        } catch (IOException e) {
            e.printStackTrace();
            throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_UNKOWN_ERROR, storedUri);
        } catch (TeddyException e) {
            e.printStackTrace();
            throw PrepException.fromTeddyException(e);
        }

        return responseMap;
    }

    public DataFrame getPreviewLinesFromFileForDataFrame(PrDataset dataset, String sheetindex, String size) throws IOException, TeddyException {
        DataFrame dataFrame = null;

        if (dataset == null) {
            throw PrepException.create(PrepErrorCodes.PREP_DATAFLOW_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_NO_DATASET);
        }

        assert dataset.getImportType() == PrDataset.IMPORT_TYPE.UPLOAD || dataset.getImportType() == PrDataset.IMPORT_TYPE.URI;

        String storedUri = dataset.getStoredUri();

        try {
            String extensionType = FilenameUtils.getExtension(storedUri);
            int limitRows = Integer.parseInt(size);
            boolean autoTyping = true;

            if(dataset.getDsType() == PrDataset.DS_TYPE.WRANGLED) {
                autoTyping = false;
            }

            File theFile = new File(new URI(storedUri));
            if(theFile.exists()==false) {
                throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_FILE_NOT_FOUND, "No file : " + storedUri);
            }

            Map<String, Object> responseMap = null;
            switch (extensionType) {
                case "xlsx":
                case "xls":
                    // Excel files are treated as CSV
                    break;
                case "json":
                    responseMap = getResponseMapFromJson(storedUri, limitRows, autoTyping);
                    break;
                default:
                    String delimiterCol = dataset.getDelimiter();
                    responseMap = getResponseMapFromCsv(storedUri, limitRows, delimiterCol, autoTyping);
            }

            if(responseMap != null) {
                List<DataFrame> gridResponses = (List<DataFrame>)responseMap.get("gridResponses");
                if( gridResponses.isEmpty()==false ) {
                    dataFrame = (DataFrame)gridResponses.get(0);
                }
            }
        } catch (URISyntaxException e1) {
            e1.printStackTrace();
            throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_MALFORMED_URI_SYNTAX, storedUri);
        } catch (Exception e) {
            LOGGER.error("Failed to read file : {}", e.getMessage());
            throw e;
        }

        return dataFrame;
    }

    public DataFrame getPreviewLinesFromFileForDataFrame_bak(PrDataset dataset, String sheetindex, String size) throws IOException, TeddyException {
        DataFrame dataFrame = new DataFrame();
        String strUri = null;

        try {
            if(dataset==null) {
                throw PrepException.create(PrepErrorCodes.PREP_DATAFLOW_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_NO_DATASET);
            }

            assert dataset.getImportType() == PrDataset.IMPORT_TYPE.UPLOAD || dataset.getImportType() == PrDataset.IMPORT_TYPE.URI;

            long totalBytes = 0L;
            InputStreamReader inputStreamReader = null;
            String storedUri = dataset.getStoredUri();

            URI uri = new URI(storedUri);

            if(uri.getScheme().equalsIgnoreCase("file")) {
                assert storedUri != null;

                File theFile = new File(uri);
                if(false==theFile.exists()) {
                    throw new IllegalArgumentException("Invalid filekey.");
                }
                totalBytes = theFile.length();
                inputStreamReader = new InputStreamReader(new FileInputStream(theFile));
            } else if(uri.getScheme().equals("hdfs")) {
                Configuration conf = this.hdfsService.getConf();
                FileSystem fs = FileSystem.get(conf);
                Path thePath = new Path(uri);

                assert fs.exists(thePath);
//                if( false==fs.exists(thePath) ) {
//                    strUri = prepProperties.getStagingBaseDir() + "/uploads/" + fileKey;
//                    thePath = new Path(new URI(strUri));
//                    if( false==fs.exists(thePath) ) {
//                        throw new IllegalArgumentException("Invalid filekey.");
//                    }
//                    // TODO: amend the dataset entity with the new path
//                }
                ContentSummary cSummary = fs.getContentSummary(thePath);
                totalBytes = cSummary.getLength();
                inputStreamReader = new InputStreamReader(fs.open(thePath));
            } else {
                assert false : uri.getScheme();
            }

            String extensionType = FilenameUtils.getExtension(storedUri);
            int findSheetIndex = Integer.parseInt(sheetindex);
            int limitSize = Integer.parseInt(size);
            int dataFrameRows = 0;
            long totalRows = 0;

            if(null==inputStreamReader) {
                throw new IllegalArgumentException("failed to open file stream: ["+storedUri+"]");
            } else {

                List<Map<String, String>> resultSet = Lists.newArrayList();

                if("json".equals(extensionType)) {
                    // 현재 FILE이면 무조건 csv로 치환됨
                } else if ("xlsx".equals(extensionType) || "xls".equals(extensionType)) {
                    // 현재 FILE이면 무조건 csv로 치환됨
                } else if ("csv".equals(extensionType)
                        || true // 기타 확장자는 모두 csv로 간주
                        ) {
                    BufferedReader br = null;
                    String line;
                    String[] csv_fields = null;
                    Boolean hasFields;
                    int maxColLength=0;
                    String delimiterCol = dataset.getDelimiter();
                    try {
                        //br = new BufferedReader(new InputStreamReader(new FileInputStream(theFile)));
                        br = new BufferedReader(inputStreamReader);

                        /*
                        // hasFields 사용안함
                        hasFields=true;
                        line = br.readLine();
                        csv_fields = Util.csvLineSplitter(line, delimiterCol, "\"");
                        for(String str : csv_fields) {
                            if(!getTypeFormString(str).equals(ColumnType.STRING)) {
                                hasFields = false;
                                break;
                            }
                        }

                        if(hasFields) {
                            //1번 라인의 type검사. String이 아닌 컬럼이 1개라도 있어야 0번 라인은 header로 인정.
                            hasFields =false;
                            line = br.readLine();
                            String[] csv_fields2 = Util.csvLineSplitter(line, delimiterCol, "\"");
                            for(String str : csv_fields2) {
                                if(!getTypeFormString(str).equals(ColumnType.STRING)) {
                                    hasFields = true;
                                    break;
                                }
                            }

                            if(hasFields) {
                                //포인터를 1번 라인에 맞춰줌.
                                br = new BufferedReader(new InputStreamReader(new FileInputStream(theFile)));
                                br.readLine();
                                maxColLength = csv_fields.length;
                            } else {
                                br = new BufferedReader(new InputStreamReader(new FileInputStream(theFile)));
                            }
                        } else {
                            br = new BufferedReader(new InputStreamReader(new FileInputStream(theFile)));
                        }
                        */

                        while ((line = br.readLine()) != null) {
                            if(limitSize <= totalRows) {
                                totalRows++;
                                continue;
                            }
                            String[] cols = Util.csvLineSplitter(line, delimiterCol, "\"");

                            //if(!hasFields && maxColLength<cols.length) {
                            if(maxColLength<cols.length) {
                                maxColLength = cols.length;
                                csv_fields = new String[cols.length];
                                for(int i=0; i<cols.length; i++){
                                    csv_fields[i]=prefixColumnName+String.valueOf(i+1);
                                }
                            }

                            Map<String,String> result = Maps.newTreeMap();
                            for(int colIdx=0;colIdx<cols.length;colIdx++) {
                                result.put(csv_fields[colIdx],cols[colIdx]);
                            }
                            resultSet.add(result);

                            totalRows++;
                            dataFrameRows++;
                        }
                    } catch (FileNotFoundException e) {
                        e.printStackTrace();
                    } catch (IOException e) {
                        e.printStackTrace();
                    } finally {
                        if (br != null) {
                            try {
                                br.close();
                            } catch (IOException e) {
                                e.printStackTrace();
                            }
                        }
                    }

                    for(int colIdx=0;colIdx<maxColLength;colIdx++) {
                        String columnName = csv_fields[colIdx];
                        dataFrame.addColumn(columnName, getTypeFormString(resultSet.get(0).get(columnName)));
                    }

                    for(int i=0;i<dataFrameRows;i++) {
                        app.metatron.discovery.domain.dataprep.teddy.Row row = new app.metatron.discovery.domain.dataprep.teddy.Row();
                        for(int j=0;j<maxColLength;j++) {
                            String columnName = csv_fields[j];
                            String value = resultSet.get(i).get(columnName);
                            row.add(columnName, value);
                        }
                        dataFrame.rows.add(row);
                    }
                }

                dataset.setTotalBytes(totalBytes);
                dataset.setTotalLines(totalRows);
            }
        } catch (URISyntaxException e1) {
            throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_MALFORMED_URI_SYNTAX, strUri);
        } catch (Exception e) {
            LOGGER.error("Failed to read file : {}", e.getMessage());
            throw e;
        }

        // This is the only point where the auto typing is applied for I.DS preview.
        // BTW, there are 2 more points where auto typing is applied. They're for upload previews.
        // Auto typing for W.DS does not use this function.
        dataFrame = teddyImpl.applyAutoTyping(dataFrame);

        return dataFrame;
    }

    public Map<String, Object> uploadFileChunk( String originalFilename, String uploadId,
                  Integer chunkIdx, Integer chunkTotal, Integer chunkSize, Integer totalSize,
                  PrDataset.STORAGE_TYPE storageType,
                  MultipartFile file) {

        Map<String, Object> responseMap = Maps.newHashMap();

        String extensionType = FilenameUtils.getExtension(originalFilename).toLowerCase();

        // now, this is for only PrDataset.STORAGE_TYPE.LOCAL;
        if(false==PrDataset.STORAGE_TYPE.LOCAL.equals(storageType)) {
            throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_FILE_KEY_MISSING, "LOCAL storage type is only support");
        }

        FileOutputStream fos=null;
        FileChannel och = null;
        FileLock lock = null;
        try {
            String tempFileName = null;
            String tempFilePath = null;

            if(0<extensionType.length()) { tempFileName = uploadId + "." + extensionType; }
            String storedUri = "file://" + this.getPathLocal(tempFileName);

            URI uri = new URI(storedUri);
            File theFile = new File(uri);

            InputStream is = file.getInputStream();

            fos = new FileOutputStream(theFile, true);
            och = fos.getChannel();

            byte[] buffer = new byte[8192];

            lock = och.lock();

            int offset = chunkIdx*chunkSize;
            int byteCnt = 0;
            int totalWrote = 0;
            while(true)
            {
                byteCnt = is.read(buffer,0,buffer.length);
                if(byteCnt == -1) break;

                if( offset<0 || totalSize<offset+byteCnt ) {
                    // index error
                    throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_CANNOT_WRITE_TO_LOCAL_PATH, "out of bound");
                }
                och.write( ByteBuffer.wrap(buffer,0,byteCnt), offset );
                offset = offset + byteCnt;
                totalWrote = totalWrote + byteCnt;
            }

            responseMap.put("success", true);
            responseMap.put("storedUri", storedUri);
            responseMap.put("chunkIdx", chunkIdx);
            responseMap.put("chunkWrote", totalWrote);
            responseMap.put("filenameBeforeUpload", originalFilename);
            responseMap.put("createTime", DateTime.now());
        } catch (Exception e) {
            LOGGER.error("Failed to upload file : {}", e.getMessage());
            responseMap.put("success", false);
            responseMap.put("message", e.getMessage());
        } finally {
            try {
                if (null != lock) {
                    lock.release();
                }
                if (null != och) {
                    och.close();
                }
                if(null!=fos) {
                    fos.close();
                }
            } catch (Exception e) {
                LOGGER.error("finally: {}", e.getMessage());
            }
        }
        return  responseMap;
    }

    public String moveExcelToCsv(String excelStrUri, String sheetName, String delimiter) {
        String csvStrUri = null;
        try {
            int idx = excelStrUri.lastIndexOf(".");
            csvStrUri = excelStrUri.substring(0, idx) + ".csv";

            URI excelUri = new URI(excelStrUri);
            String extensionType = FilenameUtils.getExtension(excelStrUri);

            Workbook wb;
            InputStream is=null;
            if ("xls".equals(extensionType)) {       // 97~2003
                wb = new HSSFWorkbook(new FileInputStream(new File(excelUri)));
            } else {   // 2007 ~
                is = new FileInputStream(new File(excelUri));
                wb = StreamingReader.builder()
                        .rowCacheSize(100)
                        .bufferSize(4096)
                        .open(is);
            }

            Sheet sheet = wb.getSheet(sheetName);

            int maxIdx = 0;
            for (Row r : sheet) {
                for (Cell c : r) {
                    int cellIdx = c.getColumnIndex();
                    if(maxIdx<=cellIdx) {
                        maxIdx = cellIdx+1;
                    }
                }
            }
            if(is!=null) {
                is.close();
            }

            if ("xls".equals(extensionType)) {       // 97~2003
                wb = new HSSFWorkbook(new FileInputStream(new File(excelUri)));
            } else {   // 2007 ~
                is = new FileInputStream(new File(excelUri));
                wb = StreamingReader.builder()
                        .rowCacheSize(100)
                        .bufferSize(4096)
                        .open(is);
            }

            sheet = wb.getSheet(sheetName);
            String separator = delimiter;

            URI csvUri = new URI(csvStrUri);
            FileWriter writer = new FileWriter(new File(csvUri));
            for (Row r : sheet) {
                int not_empty = 0;
                StringBuilder sb = new StringBuilder();
                boolean first = true;
                for (int i = 0; i < maxIdx; i++) {
                    if (i!=0) {
                        sb.append(separator);
                    }

                    Cell c = r.getCell(i);
                    if(c==null) {
                        continue;
                    }

                    Object cellValue = ExcelProcessor.getCellValue(c);
                    if(cellValue!=null) {
                        String value = String.valueOf(cellValue);
                        if(true==value.isEmpty()) {
                            value = "\"\"";
                        } else {
                            if (value.contains("\"")) {
                                value = value.replace("\"", "\"\"");
                            }
                            if (value.contains(",")) {
                                value = "\"" + value + "\"";
                            }
                            not_empty++;
                        }
                        sb.append(value);
                    }
                }
                sb.append("\n");
                if(0<not_empty) {
                    writer.append(sb.toString());
                }
            }
            writer.flush();
            writer.close();

        } catch (Exception e) {
            LOGGER.error("Failed to copy localFile : {}", e.getMessage());
        }

        return csvStrUri;
    }

    public String moveJsonToCsv(String jsonStrUri, String mainKey, String delimiter) {
        String csvStrUri = null;
        try {
            int idx = jsonStrUri.lastIndexOf(".");
            csvStrUri = jsonStrUri.substring(0, idx) + ".csv";

            URI jsonUri = new URI(jsonStrUri);
            File theFile = new File(jsonUri);

            BufferedReader br = new BufferedReader(new InputStreamReader(new FileInputStream(theFile)));
            List<Map<String, String>> resultSet = Lists.newArrayList();
            List<String> keys = new ArrayList<>();
            ObjectMapper mapper = new ObjectMapper();
            String line = "";
            int rowNo = 0;

            while((line = br.readLine())!=null) {
                Map<String, String> row = mapper.readValue(line, new TypeReference<Map<String, String>>(){});
                resultSet.add(row);

                for(int i = 0; i < row.keySet().size(); i++){
                    String key = (String) row.keySet().toArray()[i];
                    if(!keys.contains(key)) {
                        keys.add(i, key);
                    }
                }

                rowNo++;
            }

            String separator = delimiter;
            URI csvUri = new URI(csvStrUri);
            FileWriter writer = new FileWriter(new File(csvUri));
            StringBuilder stringBuilder = new StringBuilder();

            for(int i=0; i<keys.size(); i++) {
                if(i!=0) {
                    stringBuilder.append(separator);
                }
                stringBuilder.append(keys.get(i));
            }
            stringBuilder.append("\n");
            writer.append(stringBuilder.toString());

            for(int i=0; i<resultSet.size(); i++) {
                StringBuilder sb = new StringBuilder();
                Map<String, String> row = resultSet.get(i);
                Boolean isFirst = true;

                for (String key : keys) {
                    if (isFirst) {
                        isFirst = false;
                    } else {
                        sb.append(separator);
                    }

                    String value = row.get(key) == null ? "" : row.get(key);

                    if (value.contains("\"")) {
                        value = value.replace("\"", "\"\"");
                    }
                    if (value.contains(",")) {
                        value = "\"" + value + "\"";
                    }
                    sb.append(value);
                }
                sb.append("\n");
                writer.append(sb.toString());
            }
            writer.flush();
            writer.close();

        } catch (Exception e) {
            LOGGER.error("Failed to copy localFile : {}", e.getMessage());
        }

        return csvStrUri;
    }
}
