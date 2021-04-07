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

package app.metatron.discovery.util;

import org.apache.poi.hssf.util.HSSFColor;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.FontFamily;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.util.Assert;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * The type Excel utils.
 */
public class ExcelUtils {

    /**
     * List to xlsx stream byte array output stream.
     *
     * @param list the list
     * @return the byte array output stream
     * @throws IOException the io exception
     */
    public static ByteArrayOutputStream listToXlsxStream(List<Map> list) throws IOException{
        Assert.notNull(list);
        Assert.notEmpty(list);

        //Excel Workbook Create
        XSSFWorkbook wb = createXSSFWorkbook(list, "sheet");

        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        wb.write(byteArrayOutputStream);
        byteArrayOutputStream.close();

        return byteArrayOutputStream;
    }

    /**
     * List to xssl file.
     *
     * @param list     the list
     * @param fileName the file name
     * @throws IOException the io exception
     */
    public static void listToXsslFile(List<Map> list, String fileName) throws IOException{

    }

    private static XSSFWorkbook createXSSFWorkbook(List<Map> list, String sheetName){
        //Excel Workbook Create
        XSSFWorkbook wb = new XSSFWorkbook();

        //Excel Sheet Create
        XSSFSheet sheet = wb.createSheet(sheetName);

        //Header Row Create
        Set columnSet = list.get(0).keySet();
        createHeaderRow(wb, sheet, columnSet);

        //Row Columns Create
        int rowIndex = 1;
        for(Map map : list){
            createDataRow(sheet, columnSet, map, rowIndex);
            rowIndex++;
        }

        //Auto Size Column
        int cellIndexForSize = 0;
        for(Object columnName : columnSet){
            //Column Width Auto
            sheet.autoSizeColumn(cellIndexForSize, true);
            cellIndexForSize++;
        }

        return wb;
    }

    private static XSSFRow createHeaderRow(XSSFWorkbook wb, XSSFSheet sheet, Set columnSet){
        CellStyle headerCellStyle = getHeaderCellStyle(wb);
        XSSFRow headerRow = sheet.createRow(0);
        headerRow.setHeight((short) 300); // Row Height
        int headerCellIndex = 0;
        for(Object columnName : columnSet){
            // Column
            XSSFCell cell = headerRow.createCell((short) headerCellIndex);
            cell.setCellValue(columnName.toString());
            cell.setCellStyle(headerCellStyle);
            headerCellIndex++;
        }

        return headerRow;
    }

    private static CellStyle getHeaderCellStyle(XSSFWorkbook wb){
        // Cell Style
        XSSFCellStyle cellStyle = wb.createCellStyle();
        XSSFFont font = wb.createFont();

        // Font
//        font.setColor(HSSFColor.RED.index);
        font.setBold(true);
        font.setFamily(FontFamily.MODERN);
//        font.setFontHeight((short)300);
        cellStyle.setFont(font);
        // Align
        cellStyle.setAlignment(HorizontalAlignment.CENTER);

        // Border Line
//        cellStyle.setBorderTop(BorderStyle.THICK);
//        cellStyle.setBorderBottom(BorderStyle.DASH_DOT);
//        cellStyle.setBorderLeft(BorderStyle.DASHED);
//        cellStyle.setBorderRight(BorderStyle.DASHED);

        // Foreground color
        cellStyle.setFillForegroundColor(HSSFColor.GREY_25_PERCENT.index);
        cellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        return cellStyle;
    }

    private static XSSFRow createDataRow(XSSFSheet sheet, Set columnSet, Map dataMap, int rowIndex){
        XSSFRow dataRow = sheet.createRow(rowIndex);
        dataRow.setHeight((short) 300); // Row Height

        int dataCellIndex = 0;
        for(Object columnName : columnSet){
            // Column
            XSSFCell cell = dataRow.createCell((short) dataCellIndex);
            cell.setCellValue(dataMap.get(columnName).toString());
            dataCellIndex++;
        }

        return dataRow;
    }

}
