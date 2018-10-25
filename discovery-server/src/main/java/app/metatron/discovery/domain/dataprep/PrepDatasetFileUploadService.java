package app.metatron.discovery.domain.dataprep;

import com.google.common.collect.Lists;
import com.monitorjbl.xlsx.StreamingReader;
import org.apache.commons.codec.binary.StringUtils;
import org.apache.commons.io.ByteOrderMark;
import org.apache.commons.io.input.BOMInputStream;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.AsyncResult;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.charset.Charset;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Future;

@Service
public class PrepDatasetFileUploadService {
    private static Logger LOGGER = LoggerFactory.getLogger(PrepDatasetFileUploadService.class);

    @Async("prepFileUploadExecutor")
    public Future<Map<String,Object>> postUpload(String extensionType, Map<String,Object> responseMap) throws Exception {
        String fileName = (String)responseMap.get("filename");
        String filePath = (String)responseMap.get("filepath");
        String fileKey = (String)responseMap.get("filekey");

        List<String> sheets = Lists.newArrayList();
        responseMap.put("sheets", sheets);

        FileInputStream fis = null;
        FileOutputStream fos = null;
        try {
            if(extensionType.equals("csv")) {
                boolean convert = true;
                fis = new FileInputStream(filePath);
                ByteOrderMark byteOrderMark = ByteOrderMark.UTF_8;
                Charset charSet = Charset.defaultCharset();
                BOMInputStream bomInputStream = new BOMInputStream(fis,
                        ByteOrderMark.UTF_8, ByteOrderMark.UTF_16BE, ByteOrderMark.UTF_16LE, ByteOrderMark.UTF_32BE, ByteOrderMark.UTF_32LE);
                if (bomInputStream.hasBOM() == false) {
                    charSet = Charset.forName("UTF-8");
                    byteOrderMark = ByteOrderMark.UTF_8;
                    convert = false;
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

                if(true==convert) {
                    String newFilePath = filePath + ".new";
                    fos = new FileOutputStream(filePath);

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

                    File origFile = new File(filePath);
                    File newFile = new File(newFilePath);
                    origFile.delete();
                    newFile.renameTo(origFile);
                }
            } else if ("xlsx".equals(extensionType) || "xls".equals(extensionType)) {
                /*
                Workbook wb = null;
                wb = WorkbookFactory.create(new File(filePath));
                if (null != wb) {
                    int sheetsCount = wb.getNumberOfSheets();
                    for (int j = 0; j < sheetsCount; j++) {
                        sheets.add(wb.getSheetAt(j).getSheetName());
                    }
                }
                */

                Workbook workbook;
                File origFile = new File(filePath);
                if ("xls".equals(extensionType)) {       // 97~2003
                    workbook = new HSSFWorkbook(new FileInputStream(origFile));
                } else {   // 2007 ~
                    InputStream is = new FileInputStream(origFile);
                    workbook = StreamingReader.builder()
                            .rowCacheSize(100)
                            .bufferSize(4096)
                            .open(is);
                }

                for (Sheet sheet : workbook) {
                    sheets.add(sheet.getSheetName());
                    /*
                    for (Row r : sheet) {
                        for (Cell c : r) {
                            System.out.println(c.getStringCellValue());
                        }
                    }
                    */
                }
            }

            responseMap.put("success", true);
            responseMap.put("filekey", fileKey);
            responseMap.put("filepath", filePath);
            responseMap.put("filename", fileName);
        } catch (Exception e) {
            LOGGER.error("Failed to upload file : {}", e.getMessage());
            responseMap.put("success", false);
            responseMap.put("message", e.getMessage());
        } finally {
            if(null!=fis) {
                try {
                    fis.close();
                } catch(IOException e) {
                    LOGGER.error("fos.close()", e.getMessage());
                }
            }
            if(null!=fos) {
                try {
                    fos.close();
                } catch(IOException e) {
                    LOGGER.error("fos.close()", e.getMessage());
                }
            }
        }

        responseMap.put("state","done");
        return new AsyncResult<Map<String,Object>>(responseMap);
    }
}
