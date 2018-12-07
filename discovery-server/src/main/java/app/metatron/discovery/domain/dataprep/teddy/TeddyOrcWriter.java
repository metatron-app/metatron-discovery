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

package app.metatron.discovery.domain.dataprep.teddy;

import app.metatron.discovery.domain.dataprep.entity.PrSnapshot;
import app.metatron.discovery.domain.dataprep.entity.PrSnapshot.HIVE_FILE_COMPRESSION;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.hive.ql.exec.vector.*;
import org.apache.orc.CompressionKind;
import org.apache.orc.OrcFile;
import org.apache.orc.TypeDescription;
import org.apache.orc.Writer;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class TeddyOrcWriter {
  private static Logger LOGGER = LoggerFactory.getLogger(TeddyOrcWriter.class);

  private byte[] toBytes(String inputData){
    return (inputData == null) ? "".getBytes() : inputData.getBytes();
  }

  private CompressionKind convertCompressionEnum(HIVE_FILE_COMPRESSION compression) {
    switch (compression) {
      case SNAPPY:
        return CompressionKind.SNAPPY;
      case ZLIB:
        return CompressionKind.ZLIB;
      case NONE:
        return CompressionKind.NONE;
      case LZO:
        assert false : "LZO not supported by embedded engine";
    }
    return null;  // cannot reach here
  }

  private boolean setBatch(int pos, ColumnVector colVector, ColumnType colType, ColumnDescription colDesc, Object obj) {
    //null check
    if(obj == null)
      return false;

    switch (colType) {
      case STRING:
        if(!(obj instanceof  String)){
          return false;
        }
        byte[] bytes = toBytes((String) obj);
        ((BytesColumnVector) colVector).setVal(pos, bytes, 0, bytes.length);
        break;
      case LONG:
        if(!(obj instanceof  Long)){
          return false;
        }
        ((LongColumnVector) colVector).vector[pos] = (Long) obj;
        break;
      case DOUBLE:
        if(!(obj instanceof  Double)){
          return false;
        }
        ((DoubleColumnVector) colVector).vector[pos] = (Double) obj;
        break;
      case BOOLEAN:
        if(!(obj instanceof  Boolean)){
          return false;
        }
        ((LongColumnVector) colVector).vector[pos] = (Boolean) obj ? 1 : 0;
        break;
      case TIMESTAMP:
        if(!(obj instanceof  DateTime)){
          return false;
        }
        ((TimestampColumnVector) colVector).time[pos] = ((DateTime) obj).getMillis();
        ((TimestampColumnVector) colVector).nanos[pos] = 0;
        break;
      case ARRAY:
        ColumnVector[] fields = ((StructColumnVector) colVector).fields;
        for (int i = 0; i < fields.length; i++) {
          ColumnDescription subColDesc = colDesc.getArrColDesc().get(i);
          setBatch(pos, fields[i], subColDesc.getType(), subColDesc, ((List) obj).get(i));
        }
        break;
      case MAP:
        Map<String, ColumnDescription> map = colDesc.getMapColDesc();
        List<String> keys = map.keySet().stream().collect(Collectors.toList());
        fields = ((StructColumnVector) colVector).fields;
        for (int i = 0; i < fields.length; i++) {
          ColumnDescription subColDesc = map.get(keys.get(i));
          setBatch(pos, fields[i], subColDesc.getType(), subColDesc, ((Map) obj).get(keys.get(i)));
        }
        break;
      case UNKNOWN:
        break;
    }

    return true;
  }

  private void addField(TypeDescription typeDescription, String colName, ColumnType colType, ColumnDescription subColDesc) {
    switch (colType) {
      case STRING:
        typeDescription.addField(colName, TypeDescription.createString());
        break;
      case LONG:
        typeDescription.addField(colName, TypeDescription.createLong());
        break;
      case DOUBLE:
        typeDescription.addField(colName, TypeDescription.createDouble());
        break;
      case BOOLEAN:
        typeDescription.addField(colName, TypeDescription.createBoolean());
        break;
      case TIMESTAMP:
        typeDescription.addField(colName, TypeDescription.createTimestamp());
        break;
      case ARRAY:   // 이 ARRAY는 ORC의 LIST와는 다르다. STRUCT로 구현된다.
        TypeDescription structType = new TypeDescription(TypeDescription.Category.STRUCT);
        for (int i = 0; i < subColDesc.getArrColDesc().size(); i++) {
          ColumnDescription childColDesc = subColDesc.getArrColDesc().get(i);
          addField(structType, "c" + i, childColDesc.getType(), childColDesc);
        }
        typeDescription.addField(colName, structType);
        break;
      case MAP:     // 이 MAP은 ORC의 MAP과는 다르다. 역시 STRUCT로 구현된다.
        structType = new TypeDescription(TypeDescription.Category.STRUCT);
        for (String key : subColDesc.getMapColDesc().keySet()) {
          ColumnDescription childColDesc = subColDesc.getMapColDesc().get(key);
          addField(structType, key, childColDesc.getType(), childColDesc);
        }
        typeDescription.addField(colName, structType);
        break;
      case UNKNOWN:
        assert false : String.format("colName=%s colType=%s", colName, colType.name());
        break;
    }
  }

  private TypeDescription buildTypeDescription(DataFrame df) {
    TypeDescription typeDescription = new TypeDescription(TypeDescription.Category.STRUCT);

    for (int colno = 0; colno < df.getColCnt(); colno++) {
      addField(typeDescription, df.getColName(colno), df.getColType(colno), df.getColDesc(colno));
    }
    return typeDescription;
  }

  // 테스트를 위해 public이 되고, conf를 argument로 받음.
  public Integer[] writeOrc(DataFrame df, Configuration conf, Path file, PrSnapshot.HIVE_FILE_COMPRESSION compression) throws IOException {
    TypeDescription typeDescription = buildTypeDescription(df);
    Integer[] result = new Integer[2];
    int pos;    // batch상 position (0~1023)
    boolean typeCheck = true;
    int skippedLines = 0;

    LOGGER.trace("writeOrc(): start");

    OrcFile.WriterOptions options = OrcFile.writerOptions(conf).setSchema(typeDescription);
    CompressionKind compressionKind = convertCompressionEnum(compression);
    if (compressionKind != CompressionKind.NONE) {
      options = options.compress(compressionKind);
    }
    Writer writer = OrcFile.createWriter(file, options);

    VectorizedRowBatch batch = typeDescription.createRowBatch();

    for (int rowno = 0; rowno < df.rows.size(); rowno++) {
      pos = batch.size;
      Row row = df.rows.get(rowno);

      for (int colno = 0; colno < df.getColCnt(); colno++) {
        typeCheck = setBatch(pos, batch.cols[colno], df.getColType(colno), df.getColDesc(colno), row.get(colno));
        if(typeCheck == false) {
          LOGGER.warn("Row number {} was excluded caused by missing or mismatched value at column: {}, value: {}", rowno, df.getColName(colno), row.get(colno));
          break;
        }
      }

      if(typeCheck) {
        batch.size++;
      } else {
        skippedLines++;
      }
      if (batch.size == batch.getMaxSize()) {
        writer.addRowBatch(batch);
        batch.reset();
      }
    }

    if (batch.size != 0) {
      writer.addRowBatch(batch);
      batch.reset();
    }
    writer.close();

    LOGGER.trace("writeOrc(): end");
    result[0] = df.rows.size() - skippedLines;
    result[1] = skippedLines;

    return result;
  }
}
