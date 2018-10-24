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
import app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey;
import app.metatron.discovery.domain.dataprep.teddy.ColumnType;
import app.metatron.discovery.domain.dataprep.teddy.DataFrame;
import app.metatron.discovery.domain.dataprep.teddy.Util;
import app.metatron.discovery.domain.dataprep.transform.TimestampTemplate;
import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.util.ExcelProcessor;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.monitorjbl.xlsx.StreamingReader;
import org.apache.commons.codec.binary.StringUtils;
import org.apache.commons.io.ByteOrderMark;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.input.BOMInputStream;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.*;
import org.joda.time.DateTime;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.charset.Charset;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.Future;

@Service
public class PrepDatasetFileService {
    private static Logger LOGGER = LoggerFactory.getLogger(PrepDatasetFileService.class);

    @Autowired
    PrepDatasetRepository datasetRepository;

    @Autowired(required = false)
    PrepProperties prepProperties;

    @Autowired
    PrepDatasetFileUploadService fileUploadService;

    Map<String, Future<Map<String,Object>>> futures = null;

    public PrepDatasetFileService() {
        this.futures = Maps.newHashMap();
    }
    private String fileDatasetUploadLocalPath=null;

    private String prefixColumnName = "column";

    private String getPathLocal_new(String fileKey) {
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

    private Boolean createHeaderRow(Sheet sheet) {
        Boolean hasFields=true;

        for(int i = 0; i < sheet.getRow(0).getPhysicalNumberOfCells(); i++) {
            if(!sheet.getRow(0).getCell(i).getCellTypeEnum().equals(CellType.STRING)) {
                hasFields = false;
                break;
            }
        }

        if(hasFields) {
            hasFields = false;
            for(int i = 0; i < sheet.getRow(1).getPhysicalNumberOfCells(); i++) {
                if(!sheet.getRow(1).getCell(i).getCellTypeEnum().equals(CellType.STRING)) {
                    hasFields = true;
                    break;
                }
            }
        }

        if(!hasFields) {
            sheet.shiftRows(0, sheet.getLastRowNum(), 1);

            Row row = sheet.createRow(0);
            for (int i = 0; i < sheet.getRow(1).getPhysicalNumberOfCells(); i++) {
                Cell cell = row.createCell(i);
                cell.setCellValue(prefixColumnName + String.valueOf(i + 1));
            }
        }

        return hasFields;
    }

    private Field makeField(int idx, String fieldKey, Cell dataCell) {
        DataType fieldType;
        Field.FieldRole fieldBIType;

        switch (dataCell.getCellType()) {
            case Cell.CELL_TYPE_STRING:
                fieldType = DataType.TEXT;
                fieldBIType = Field.FieldRole.DIMENSION;
                break;
            case Cell.CELL_TYPE_NUMERIC:
                if (DateUtil.isCellDateFormatted(dataCell)) {
                    fieldType = DataType.TIMESTAMP;
                    fieldBIType = Field.FieldRole.TIMESTAMP;
                } else {
                    fieldType = DataType.DOUBLE;
                    fieldBIType = Field.FieldRole.MEASURE;
                }
                break;
            case Cell.CELL_TYPE_BOOLEAN:
                fieldType = DataType.BOOLEAN;
                fieldBIType = Field.FieldRole.DIMENSION;
                break;
            case Cell.CELL_TYPE_FORMULA:
            default:
                fieldType = DataType.TEXT;
                fieldBIType = Field.FieldRole.DIMENSION;
        }

        return new Field(fieldKey, fieldType, fieldBIType, new Long(idx + 1));
    }

    private String getCellValue(Cell cell) {
        String v = null;

        switch (cell.getCellType()) {
            case Cell.CELL_TYPE_STRING:
                v = cell.getRichStringCellValue().getString();
                break;
            case Cell.CELL_TYPE_NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    v = new DateTime(cell.getDateCellValue().getTime()).toString();
                } else {
                    v = String.valueOf(cell.getNumericCellValue());
                }
                break;
            case Cell.CELL_TYPE_BOOLEAN:
                v = String.valueOf(cell.getBooleanCellValue());
                break;
            case Cell.CELL_TYPE_FORMULA:
                v = cell.getCellFormula();
                break;
            default:
        }
        return v;
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

    private Field makeFieldFromCSV(int idx, String fieldKey, String str){
        DataType fieldType;
        Field.FieldRole fieldBIType;

        switch (getTypeFormString(str)) {
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

    Map<String, Object> fileCheckSheet2(String fileKey, String sheetname, String sheetindex, String size, String delimiterRow, String delimiterCol, String hasFieldsFlag) {

        Map<String, Object> responseMap = Maps.newHashMap();

        try {
            String filePath = getPathLocal_new( fileKey );
            String extensionType = FilenameUtils.getExtension(fileKey);
            boolean hasFields;
            int findSheetIndex = Integer.parseInt(sheetindex);
            int limitSize = Integer.parseInt(size);
            long totalBytes = 0L;
            int totalRows = 0;

            File theFile = new File(filePath);
            if(false==theFile.exists()) {
                responseMap.put("success", false);
                responseMap.put("message", "Invalid filekey.");
                throw new IllegalArgumentException("Invalid filekey.");
            } else {
                totalBytes = theFile.length();

                List<Map<String, String>> resultSet = Lists.newArrayList();
                List<Field> fields = Lists.newArrayList();
                List<Map<String, String>> headers = Lists.newArrayList();

                Sheet sheet = null;
                if ("xlsx".equals(extensionType) || "xls".equals(extensionType)) {
                    /*
                    Workbook wb = null;

                    if ("xlsx".equals(extensionType)) {
                        wb = new XSSFWorkbook(theFile);
                    } else if("xls".equals(extensionType)) {
                        wb = new HSSFWorkbook(new FileInputStream(theFile));
                    }
                    if (sheetname != null)
                        findSheetIndex = wb.getSheetIndex(sheetname);

                    sheet = wb.getSheetAt(findSheetIndex);
                    */

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

                    sheet = workbook.getSheet(sheetname);
                    totalRows = sheet.getLastRowNum()+1;

                    //int numCols = sheet.getRow(sheet.getFirstRowNum()).getLastCellNum()+1;
                    /*
                    int numCols = 0;
                    for (Row r : sheet) {
                        if (r == null) {
                            continue;
                        }
                        for (Cell c : r) {
                            numCols++;
                        }
                        break;
                    }
                    String[] csv_fields = new String[numCols];
                    for(int i=0;i<numCols;i++) {
                        csv_fields[i] = prefixColumnName + String.valueOf(i + 1);
                        fields.add(makeFieldFromCSV(i, csv_fields[i], "STRING"));
                    }
                    */

                    for (Row r : sheet) {
                        if(r==null) {
                            resultSet.add(Maps.newHashMap());
                            continue;
                        }
                        if(limitSize<=r.getRowNum()) { break; }

                        Map<String,String> result = Maps.newHashMap();
                        for (Cell c : r) {
                            int cellIdx = c.getColumnIndex();
                            Field f = null;
                            if(cellIdx<fields.size()) {
                                f = fields.get(cellIdx);
                            }
                            if(f==null) {
                                f = makeFieldFromCSV(cellIdx, prefixColumnName + String.valueOf(cellIdx+1), "STRING");
                                fields.add(cellIdx, f);
                            }

                            if(c==null) {
                                result.put(f.getName(), null);
                            } else {
                                Object cellValue = ExcelProcessor.getCellValue(c);
                                String strCellValue = String.valueOf(cellValue);
                                result.put(f.getName(), strCellValue);
                            }
                        }
                        resultSet.add( result );
                    }

                    /*
                    createHeaderRow(sheet);
                    totalRows = sheet.getPhysicalNumberOfRows()-1;

                    Row headerRow = sheet.getRow(0);
                    Row dataRow = sheet.getRow(1);
                    int fieldSize = dataRow.getLastCellNum();
                    for (int i = 0; i < fieldSize; i++) {
                        fields.add(makeField(i, getCellValue(headerRow.getCell(i)), dataRow.getCell(i)));
                    }

                    resultSet = PolarisUtils.getResultSetFromSheet(sheet);

                    for(Map<String,String> result : resultSet) {
                        if(result.size()<fieldSize) {
                            for(int i=0;i<fieldSize;i++) {
                                String fieldKey = fields.get(i).getName();
                                if(null==result.get(fieldKey)) {
                                    result.put(fieldKey,"");
                                }
                            }
                        }
                    }
                    */
                } else if ( "csv".equals(extensionType) ) {
                    BufferedReader br = null;
                    String line;
                    String[] csv_fields;
                    int maxColLength = 0;
                    try {
                        br = new BufferedReader(new InputStreamReader(new FileInputStream(theFile)));

                        //0번 라인의 Type 검사. String이 아닌 컬럼이 1개라도 있으면 header로 인정하지 않음.
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

                        while ((line = br.readLine()) != null) {
                            if(limitSize <= totalRows) {
                                break;
                            }
                            String[] cols = Util.csvLineSplitter(line, delimiterCol, "\"");

                            if(!hasFields && maxColLength<cols.length) {
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
                        }

                        for (int colIdx = 0; colIdx < maxColLength; colIdx++) {
                            String field = csv_fields[colIdx];
                            fields.add(makeFieldFromCSV(colIdx, field, resultSet.get(0).get(field)));
                        }
                    } catch (FileNotFoundException e) {
                        e.printStackTrace();
                    } catch (IOException e) {
                        e.printStackTrace();
                    } catch (Exception e) {
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
                }

                responseMap.put("success", true);
                responseMap.put("headers", headers);
                responseMap.put("fields", fields);

                int resultSetSize = resultSet.size();
                int endIndex = resultSetSize - limitSize < 0 ? resultSetSize : limitSize;

                responseMap.put("data", resultSet.subList(0, endIndex));
                responseMap.put("totalRows", totalRows);
                responseMap.put("totalBytes", totalBytes);
            }
        } catch (Exception e) {
            LOGGER.error("Failed to upload file : {}", e.getMessage());
            responseMap.put("success", false);
            responseMap.put("message", e.getClass().getName());
            //responseMap.put("message", e.getMessage());
        }

        return responseMap;
    }

    DataFrame getPreviewLinesFromFileForDataFrame( PrepDataset dataset, String fileKey, String sheetindex, String size) {
        DataFrame dataFrame = new DataFrame();

        try {
            if(dataset==null) {
                throw PrepException.create(PrepErrorCodes.PREP_DATAFLOW_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_NO_DATASET);
            }

            String filePath = fileKey;
            PrepDataset.FILE_TYPE fileType = dataset.getFileTypeEnum();
            if(fileType == PrepDataset.FILE_TYPE.LOCAL || fileType==PrepDataset.FILE_TYPE.HDFS) {
                filePath = getPathLocal_new( fileKey );
            }
            String extensionType = FilenameUtils.getExtension(fileKey);
            int findSheetIndex = Integer.parseInt(sheetindex);
            int limitSize = Integer.parseInt(size);
            long totalBytes = 0L;
            int totalRows = 0;
            int dataFrameRows = 0;

            File theFile = new File(filePath);
            if(false==theFile.exists()) {
                throw new IllegalArgumentException("Invalid filekey.");
            } else {
                totalBytes = theFile.length();

                List<Map<String, String>> resultSet = Lists.newArrayList();

                if ("csv".equals(extensionType)) {
                    BufferedReader br = null;
                    String line;
                    String[] csv_fields = null;
                    Boolean hasFields;
                    int maxColLength=0;
                    String delimiterCol = dataset.getDelimiter();
                    try {
                        br = new BufferedReader(new InputStreamReader(new FileInputStream(theFile)));

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

                        while ((line = br.readLine()) != null) {
                            if(limitSize <= totalRows) {
                                totalRows++;
                                continue;
                            }
                            String[] cols = Util.csvLineSplitter(line, delimiterCol, "\"");

                            if(!hasFields && maxColLength<cols.length) {
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
                } else if("json".equals(extensionType)) {
                    // 현재 FILE이면 무조건 csv로 치환됨
                } else if ("xlsx".equals(extensionType) || "xls".equals(extensionType)) {
                    // 현재 FILE이면 무조건 csv로 치환됨
                }

                dataset.setTotalBytes(totalBytes);
                dataset.setTotalLines(totalRows);
            }
        } catch (Exception e) {
            LOGGER.error("Failed to read file : {}", e.getMessage());
            throw e;
        }

        return dataFrame;
    }

    public Map<String, Object> uploadFile(MultipartFile file) {
        Map<String, Object> responseMap = Maps.newHashMap();

        String fileName = file.getOriginalFilename();
        String extensionType = FilenameUtils.getExtension(fileName).toLowerCase();
        if(extensionType!=null && extensionType.isEmpty()) {
            extensionType = "none";
        }

        FileOutputStream fos=null;
        try {
            String tempFileName = null;
            String tempFilePath = null;

            int i=0;
            while(i<5) {
                tempFileName = UUID.randomUUID().toString() + "." + extensionType;
                tempFilePath = this.getPathLocal_new(tempFileName);

                File newFile = new File(tempFilePath);
                if(false==newFile.exists()) {
                    file.transferTo(newFile);
                    break;
                }
                i++;
            }
            if(5<=i) {
                responseMap.put("success", false);
                responseMap.put("message", "making UUID was failed. try again");
            } else {
                responseMap.put("success", true);
                responseMap.put("filekey", tempFileName);
                responseMap.put("filepath", tempFilePath);
                responseMap.put("filename", fileName);
                responseMap.put("createTime", DateTime.now());

                Future<Map<String,Object>> future = this.fileUploadService.postUpload(extensionType, responseMap);
                futures.put(tempFileName, future);
            }
        } catch (Exception e) {
            LOGGER.error("Failed to upload file : {}", e.getMessage());
            responseMap.put("success", false);
            responseMap.put("message", e.getMessage());
        } finally {
            if(null!=fos) {
                try {
                    fos.close();
                } catch(IOException e) {
                    LOGGER.error("fos.close()", e.getMessage());
                }
            }
        }
        return  responseMap;
    }

    public Map<String, Object> pollUploadFile(String fileKey) throws Exception {
        Map<String,Object> responseMap = null;
        try {
            Future<Map<String, Object>> future = this.futures.get(fileKey);
            if (null == future) {
                throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_WRONG_MAP_KEY, "No key : " + fileKey);
            } else {
                if (true == future.isDone()) {
                    responseMap = future.get();
                } else if(true == future.isCancelled()) {
                } else {
                    responseMap = Maps.newHashMap();
                    responseMap.put("state","running");
                }
            }
        } catch(Exception e) {
            throw e;
        }

        return responseMap;
    }

    public Map<String, Object> uploadFile2(MultipartFile file) {
        Map<String, Object> responseMap = Maps.newHashMap();

        String fileName = file.getOriginalFilename();
        String extensionType = FilenameUtils.getExtension(fileName).toLowerCase();
        if(extensionType!=null && extensionType.isEmpty()) {
            extensionType = "none";
        }

        FileOutputStream fos=null;
        try {
            String tempFileName = null;
            String tempFilePath = null;

            int i=0;
            while(i<5) {
                tempFileName = UUID.randomUUID().toString() + "." + extensionType;
                tempFilePath = this.getPathLocal_new(tempFileName);

                File newFile = new File(tempFilePath);
                if(false==newFile.exists()) {
                    break;
                }
                i++;
            }
            if(5<=i) {
                responseMap.put("success", false);
                responseMap.put("message", "making UUID was failed. try again");
            } else {
                if(extensionType.equals("csv")) {
                    ByteOrderMark byteOrderMark = ByteOrderMark.UTF_8;
                    Charset charSet = Charset.defaultCharset();
                    BOMInputStream bomInputStream = new BOMInputStream(file.getInputStream(),
                            ByteOrderMark.UTF_8, ByteOrderMark.UTF_16BE, ByteOrderMark.UTF_16LE, ByteOrderMark.UTF_32BE, ByteOrderMark.UTF_32LE);
                    if (bomInputStream.hasBOM() == false) {
                        charSet = Charset.forName("UTF-8");
                        byteOrderMark = ByteOrderMark.UTF_8;
                    } else if (bomInputStream.hasBOM(ByteOrderMark.UTF_8)) {
                        charSet = Charset.forName("UTF-8");
                        byteOrderMark = bomInputStream.getBOM();
                    } else if (bomInputStream.hasBOM(ByteOrderMark.UTF_16LE)) {
                        charSet = Charset.forName("UTF-16LE");
                        byteOrderMark = bomInputStream.getBOM();
                    } else if (bomInputStream.hasBOM(ByteOrderMark.UTF_16BE)) {
                        charSet = Charset.forName("UTF-16BE");
                        byteOrderMark = bomInputStream.getBOM();
                    } else if (bomInputStream.hasBOM(ByteOrderMark.UTF_32LE)) {
                        charSet = Charset.forName("UTF-32LE");
                        byteOrderMark = bomInputStream.getBOM();
                    } else if (bomInputStream.hasBOM(ByteOrderMark.UTF_32BE)) {
                        charSet = Charset.forName("UTF-32BE");
                        byteOrderMark = bomInputStream.getBOM();
                    }

                    fos = new FileOutputStream(tempFilePath);

                    InputStreamReader isr = new InputStreamReader(bomInputStream, charSet);
                    BufferedReader br = new BufferedReader(isr);
                    String line;
                    while ((line = br.readLine()) != null) {
                        if (bomInputStream.hasBOM() && byteOrderMark != ByteOrderMark.UTF_8) {
                            byte[] utf8 = StringUtils.getBytesUtf8(line);
                            fos.write(utf8);
                        } else {
                            fos.write(line.getBytes(charSet));
                        }
                        fos.write('\n');
                    }
                } else {
                    byte fileData[] = file.getBytes();
                    fos = new FileOutputStream(tempFilePath);
                    fos.write(fileData);
                }

                List<String> sheets = Lists.newArrayList();
                responseMap.put("sheets", sheets);

                if ("xlsx".equals(extensionType) || "xls".equals(extensionType)) {
                    /*
                    Workbook wb = null;
                    wb = WorkbookFactory.create(new File(tempFilePath));
                    if (null != wb) {
                        int sheetsCount = wb.getNumberOfSheets();
                        for (int j = 0; j < sheetsCount; j++) {
                            sheets.add(wb.getSheetAt(j).getSheetName());
                        }
                    }
                    */

                    Workbook workbook;
                    if ("xls".equals(extensionType)) {       // 97~2003
                        workbook = new HSSFWorkbook(new FileInputStream(new File(tempFilePath)));
                    } else {   // 2007 ~
                        InputStream is = new FileInputStream(new File(tempFilePath));
                        workbook = StreamingReader.builder()
                                .rowCacheSize(100)
                                .bufferSize(4096)
                                .open(is);
                    }

                    if (null != workbook) {
                        int sheetsCount = workbook.getNumberOfSheets();
                        for (Sheet sheet : workbook) {
                            sheets.add(sheet.getSheetName());
                        }
                    }
                }
                responseMap.put("success", true);
                responseMap.put("filekey", tempFileName);
                responseMap.put("filepath", tempFilePath);
                responseMap.put("filename", fileName);
            }
        } catch (Exception e) {
            LOGGER.error("Failed to upload file : {}", e.getMessage());
            responseMap.put("success", false);
            responseMap.put("message", e.getMessage());
        } finally {
            if(null!=fos) {
                try {
                    fos.close();
                } catch(IOException e) {
                    LOGGER.error("fos.close()", e.getMessage());
                }
            }
        }

        return responseMap;
    }

    public String moveExcelToCsv(String fileKey, String sheetName, String delimiter) {
        String csvFileName = null;
        try {
            int idx = fileKey.lastIndexOf(".");
            String extensionType = fileKey.substring(idx+1);
            String newFileKey = fileKey.substring(0, idx) + ".csv";

            String excelFileName = this.getPathLocal_new(fileKey);
            csvFileName = this.getPathLocal_new(newFileKey);

            /*
            File theFile = new File(excelFileName);
            Workbook wb = null;
            if ("xlsx".equals(extensionType)) {
                wb = new XSSFWorkbook(theFile);
            } else if ("xls".equals(extensionType)) {
                wb = new HSSFWorkbook(new FileInputStream(theFile));
            }
            int findSheetIndex = wb.getSheetIndex(sheetName);
            Sheet sheet = wb.getSheetAt(findSheetIndex);
            */

            Workbook wb;
            InputStream is=null;
            if ("xls".equals(extensionType)) {       // 97~2003
                wb = new HSSFWorkbook(new FileInputStream(new File(excelFileName)));
            } else {   // 2007 ~
                is = new FileInputStream(new File(excelFileName));
                wb = StreamingReader.builder()
                        .rowCacheSize(100)
                        .bufferSize(4096)
                        .open(is);
            }

            Sheet sheet = wb.getSheet(sheetName);

            int maxIdx = 0;
            for (Row r : sheet) {
                for (Cell c : r) {
                    int colIdx = c.getColumnIndex();
                    if(maxIdx<colIdx) {
                        maxIdx = colIdx;
                    }
                }
            }
            if(is!=null) {
                is.close();
            }

            if ("xls".equals(extensionType)) {       // 97~2003
                wb = new HSSFWorkbook(new FileInputStream(new File(excelFileName)));
            } else {   // 2007 ~
                is = new FileInputStream(new File(excelFileName));
                wb = StreamingReader.builder()
                        .rowCacheSize(100)
                        .bufferSize(4096)
                        .open(is);
            }

            sheet = wb.getSheet(sheetName);
            String separator = delimiter;
            FileWriter writer = new FileWriter(csvFileName);
            for (Row r : sheet) {
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
                    String value = String.valueOf(cellValue);
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

            /*
            Sheet sheet = wb.getSheet(sheetName);
            List<Map<String, String>> resultSet = Lists.newArrayList();
            if(createHeaderRow(sheet)){
                //getResultSetFromSheet()에서 0번째 row가 제거되기 때문에  원본에 Header가 있던 sheet의 경우 0번 row를 더미로 채운다.
                sheet.shiftRows(0, sheet.getLastRowNum(), 1);

                Row row = sheet.createRow(0);
                for (int i = 0; i < sheet.getRow(1).getPhysicalNumberOfCells(); i++) {
                    Cell cell = row.createCell(i);
                    cell.setCellValue(prefixColumnName + String.valueOf(i + 1));
                }
            }
            int totalRows = sheet.getPhysicalNumberOfRows();

            List<Field> fields = Lists.newArrayList();
            Row headerRow = sheet.getRow(0);
            Row dataRow = sheet.getRow(1);
            int fieldSize = headerRow.getLastCellNum();
            for (int i = 0; i < fieldSize; i++) {
                fields.add(makeField(i, getCellValue(headerRow.getCell(i)), dataRow.getCell(i)));
            }

            resultSet = PolarisUtils.getResultSetFromSheet(sheet);

            List<String> keySet = Lists.newArrayList();
            for(Map<String,String> result : resultSet) {
                if(result.size()<fieldSize) {
                    for(int i=0;i<fieldSize;i++) {
                        String fieldKey = fields.get(i).getName();
                        if(null==result.get(fieldKey)) {
                            result.put(fieldKey,"");
                        }
                    }
                } else if (0 == keySet.size()) {
                    keySet.addAll(result.keySet());
                    Collections.sort(keySet, new Comparator<String>() {
                        public int compare(String k1,String k2) {
                            int len1 = k1.length();
                            int len2 = k2.length();
                            if(len1<len2) { return -1; }
                            else if(len1>len2) { return 1; }
                            else { return k1.compareTo(k2); }
                        }
                    });
                }
            }

            String separator = delimiter;
            FileWriter writer = new FileWriter(csvFileName);
            for (Map<String, String> result : resultSet) {
                StringBuilder sb = new StringBuilder();
                boolean first = true;
                for (String key : keySet) {
                    if (false==first) { sb.append(separator); }

                    String value = result.get(key);
                    if (value.contains("\"")) {
                        value = value.replace("\"", "\"\"");
                    }
                    if (value.contains(",") ) {
                        value = "\"" + value + "\"";
                    }
                    sb.append(value);
                    first = false;
                }
                sb.append("\n");
                writer.append(sb.toString());
            }
            writer.flush();
            writer.close();
            */
        } catch (Exception e) {
            LOGGER.error("Failed to copy localFile : {}", e.getMessage());
        }

        return csvFileName;
    }
}
