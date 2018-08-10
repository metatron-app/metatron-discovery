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

package app.metatron.discovery.domain.datasource.ingestion.file;

import com.fasterxml.jackson.annotation.JsonTypeName;

/**
 * Created by kyungtaak on 2017. 4. 30..
 */
@JsonTypeName("parquet")
public class ParquetFileFormat implements FileFormat {

  String compress;

  public ParquetFileFormat() {
  }

  @Override
  public String getInputFormat() {
    return "io.druid.data.input.parquet.DruidParquetInputFormat";
  }

  public String getCompress() {
    return compress;
  }

  public void setCompress(String compress) {
    this.compress = compress;
  }
}
