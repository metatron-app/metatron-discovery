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

package app.metatron.discovery.domain.datasource;

import org.joda.time.DateTime;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Arrays;
import java.util.List;

import app.metatron.discovery.AbstractIntegrationTest;

/**
 * Created by kyungtaak on 2016. 8. 31..
 */
public class DataSourceQueryHistoryRepositoryTest extends AbstractIntegrationTest {

  @Autowired
  DataSourceQueryHistoryRepository historyRepository;

  @Test
  public void findByQueryCountPerHour() throws Exception {
    historyRepository.save(new DataSourceQueryHistory("ds-100"));
    historyRepository.save(new DataSourceQueryHistory("ds-100"));
    historyRepository.save(new DataSourceQueryHistory("ds-100"));
    historyRepository.save(new DataSourceQueryHistory("ds-100"));

    List<Object> hist = historyRepository.findByQueryCountPerHour("ds-100", DateTime.now().minusDays(1));
    System.out.println(Arrays.toString((Object[]) hist.get(0)));

    for(Object obj : (Object[]) hist.get(0)) {
      System.out.println(obj.getClass());
    }
  }


  @Test
  public void findByDataSourceIdCountPerElapsedTime() {
    historyRepository.save(new DataSourceQueryHistory("ds-100"));
    historyRepository.save(new DataSourceQueryHistory("ds-100"));
    historyRepository.save(new DataSourceQueryHistory("ds-100"));
    historyRepository.save(new DataSourceQueryHistory("ds-100"));

    List<Object> hist = historyRepository.findByQueryCountPerElapsedTime("ds-100", DateTime.now().minusDays(1));
    System.out.println(Arrays.toString((Object[]) hist.get(0)));
  }

  @Test
  public void save_when_long_uri() {
    // given
    final String longURI = "http://www.test.com/app/v2/dashboard/3f9aaf8e-d541-4187-95b3-e11bccc1460e?work_no=O190314000077&event_time=2019-03-14%2020:00:00%2F2019-03-21%2020:00:00&occr_dt=20190308&occr_dt=20190309&occr_dt=20190310&occr_dt=20190311&occr_dt=20190312&occr_dt=20190313&occr_dt=20190314&occr_dt=20190315&occr_dt=20190316&occr_dt=20190317";
    DataSourceQueryHistory dataSourceQueryHistory = new DataSourceQueryHistory("ds-100");
    dataSourceQueryHistory.setFromUri(longURI);

    // when
    historyRepository.save(dataSourceQueryHistory);
    historyRepository.flush();

    // then
    // nothing...

  }
}
