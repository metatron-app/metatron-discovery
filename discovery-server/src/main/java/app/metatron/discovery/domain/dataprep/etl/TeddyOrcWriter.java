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

package app.metatron.discovery.domain.dataprep.etl;

import app.metatron.discovery.domain.dataprep.entity.PrSnapshot;
import app.metatron.discovery.domain.dataprep.entity.PrSnapshot.HIVE_FILE_COMPRESSION;
import app.metatron.discovery.domain.dataprep.teddy.ColumnDescription;
import app.metatron.discovery.domain.dataprep.teddy.ColumnType;
import app.metatron.discovery.domain.dataprep.teddy.DataFrame;
import app.metatron.discovery.domain.dataprep.teddy.Row;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.hive.ql.exec.vector.BytesColumnVector;
import org.apache.hadoop.hive.ql.exec.vector.ColumnVector;
import org.apache.hadoop.hive.ql.exec.vector.DoubleColumnVector;
import org.apache.hadoop.hive.ql.exec.vector.ListColumnVector;
import org.apache.hadoop.hive.ql.exec.vector.LongColumnVector;
import org.apache.hadoop.hive.ql.exec.vector.StructColumnVector;
import org.apache.hadoop.hive.ql.exec.vector.TimestampColumnVector;
import org.apache.hadoop.hive.ql.exec.vector.VectorizedRowBatch;
import org.apache.orc.CompressionKind;
import org.apache.orc.OrcFile;
import org.apache.orc.TypeDescription;
import org.apache.orc.Writer;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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

  // TODO: distinguish MISMATCHED, MISSING, VALID
  private boolean setList(ListColumnVector listColVector, ColumnType subType, int pos, List list) {
    if (list == null) {
      listColVector.isNull[pos] = true;
      listColVector.noNulls = false;
      return false;   // MISSING
    }

    if (listColVector.childCount + list.size() > listColVector.child.isNull.length) {
      listColVector.child.ensureSize(listColVector.childCount * 2, true);
    }
    listColVector.lengths[pos] = list.size();
    listColVector.offsets[pos] = listColVector.childCount;

    ColumnVector colVector = listColVector.child;

    for (int i = 0; i < listColVector.lengths[pos]; ++i) {
      Object obj = list.get(i);

      switch (subType) {
        case STRING:
          if(!(obj instanceof  String)){    // MISMATCHED
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
        default:
          assert false : subType;
      }
    }
    return true;
  }

  // TODO: distinguish MISMATCHED, MISSING, VALID
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
        ColumnType uniformSubType = colDesc.hasUniformSubType();
        if (uniformSubType != ColumnType.UNKNOWN) {
          setList((ListColumnVector) colVector, uniformSubType, pos, (List) obj);
          break;
        }
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

  private void addField(TypeDescription typeDescription, String colName, ColumnType colType, ColumnDescription colDesc) {
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
      case MAP:     // The dataprep's map type becomes ORC/HIVE's struct type.
        TypeDescription structType = new TypeDescription(TypeDescription.Category.STRUCT);
        for (String key : colDesc.getMapColDesc().keySet()) {
          ColumnDescription childColDesc = colDesc.getMapColDesc().get(key);
          addField(structType, key, childColDesc.getType(), childColDesc);
        }
        typeDescription.addField(colName, structType);
        break;
      case ARRAY:   // If all elements are the same type, it becomes ORC/HIVE's array. Or it becomes struct.
        ColumnType uniformSubType = colDesc.hasUniformSubType();
        if (uniformSubType != ColumnType.UNKNOWN) {
          TypeDescription listType = null;
          switch (uniformSubType) {
            case STRING:
              listType = TypeDescription.createList(TypeDescription.createString());
              break;
            case LONG:
              listType = TypeDescription.createList(TypeDescription.createLong());
              break;
            case DOUBLE:
              listType = TypeDescription.createList(TypeDescription.createDouble());
              break;
            case BOOLEAN:
              listType = TypeDescription.createList(TypeDescription.createBoolean());
              break;
            case TIMESTAMP:
              listType = TypeDescription.createList(TypeDescription.createTimestamp());
              break;
            default:
              assert false : uniformSubType;
          }
          typeDescription.addField(colName, listType);
        } else {
          structType = new TypeDescription(TypeDescription.Category.STRUCT);
          for (int i = 0; i < colDesc.getArrColDesc().size(); i++) {
            ColumnDescription childColDesc = colDesc.getArrColDesc().get(i);
            addField(structType, "c" + i, childColDesc.getType(), childColDesc);
          }
          typeDescription.addField(colName, structType);
        }
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
