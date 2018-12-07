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

package app.metatron.discovery.domain.dataprep.transform;

import app.metatron.discovery.domain.dataprep.teddy.ColumnType;
import app.metatron.discovery.domain.dataprep.teddy.Histogram;
import app.metatron.discovery.domain.dataprep.teddy.Row;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.AsyncResult;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.Future;

@Service
public class PrepHistogramService {
  @Async("threadPoolTaskExecutor")
  public Future<Histogram> updateHist(String colName, ColumnType colType, List<Row> rows, int colno) {
    return new AsyncResult<>(Histogram.createHist(colName, colType, rows, colno, null));
  }

  @Async("threadPoolTaskExecutor")
  public Future<Histogram> updateHistWithColWidth(String colName, ColumnType colType, List<Row> rows, int colno, int colWidth) {
    return new AsyncResult<>(Histogram.createHist(colName, colType, rows, colno, colWidth));
  }
}
