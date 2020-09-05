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

package app.metatron.discovery.domain.workbook.configurations.datasource;

import org.junit.Test;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

public class MultiDataSourceTest {
    @Test
    public void getDatasourceByName(){
        List<DataSource> dataSources = new ArrayList<>();
        DataSource ingestedDataSource = new DefaultDataSource("IngestedDs");
        ingestedDataSource.setConnType(app.metatron.discovery.domain.datasource.DataSource.ConnectionType.ENGINE);

        DataSource linkedDataSource = new DefaultDataSource("LinkedDs_gsky");
        linkedDataSource.setConnType(app.metatron.discovery.domain.datasource.DataSource.ConnectionType.LINK);

        dataSources.add(ingestedDataSource);
        dataSources.add(linkedDataSource);
        MultiDataSource multiDataSource = new MultiDataSource(dataSources, null);

        //noinspection ResultOfMethodCallIgnored
        assertThat(multiDataSource.getDatasourceByName("IngestedDs"));
        //noinspection ResultOfMethodCallIgnored
        assertThat(multiDataSource.getDatasourceByName("LinkedDs"));
        //noinspection ResultOfMethodCallIgnored
        assertThat(multiDataSource.getDatasourceByName("LinkedDs_gsky"));
    }
}
