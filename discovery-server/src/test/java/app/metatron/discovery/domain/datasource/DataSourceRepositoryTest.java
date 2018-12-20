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

import app.metatron.discovery.AbstractIntegrationTest;
import app.metatron.discovery.common.datasource.DataType;
import app.metatron.discovery.domain.workspace.WorkspaceRepository;
import com.google.common.collect.Lists;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import org.junit.Assert;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.jdbc.Sql;

import java.util.ArrayList;
import java.util.List;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

/**
 * Created by kyungtaak on 15. 12. 2..
 */
public class DataSourceRepositoryTest extends AbstractIntegrationTest {

  @Autowired
  DataSourceRepository dataSourceRepository;

  @Autowired
  WorkspaceRepository workspaceRepository;

  @Test
  public void saveTest() {
    DataSource ds = new DataSource();
    ds.setName("DataSourceName");
    ds.setOwnerId("polaris");
    ds.setDataSourceType(DataSource.DataSourceType.JOIN);
//    ds.setFilePath("file.path");

    List<Field> fields = new ArrayList<Field>();
    for( int i=0; i<10; i++ ){
      Field fieldTable = new Field();
      fieldTable.setName("type-" + i);
      fieldTable.setType(DataType.TEXT);
      fieldTable.setRole(Field.FieldRole.DIMENSION);
//      fieldTable.setDataSource(ds);
      fields.add(fieldTable);
    }

    ds.setFields(fields);
    dataSourceRepository.saveAndFlush(ds);

    System.out.println(ToStringBuilder.reflectionToString(ds, ToStringStyle.MULTI_LINE_STYLE));
  }

  @Test
  public void crudTest() {
    DataSource dataSource = new DataSource();
    dataSource.setName("test");
    dataSource.setGranularity(DataSource.GranularityType.DAY);

    dataSourceRepository.saveAndFlush(dataSource);
    System.out.println(ToStringBuilder.reflectionToString(dataSource, ToStringStyle.MULTI_LINE_STYLE));


    DataSource savedDataSource = dataSourceRepository.getOne(dataSource.getId());
    System.out.println("SAVE:: " + ToStringBuilder.reflectionToString(savedDataSource, ToStringStyle.MULTI_LINE_STYLE));


    savedDataSource.addField(new Field("data1", DataType.TEXT, Field.FieldRole.DIMENSION, Long.valueOf(0)));
    savedDataSource.addField(new Field("data2", DataType.INTEGER, Field.FieldRole.DIMENSION, Long.valueOf(1)));
    savedDataSource.addField(new Field("data3", DataType.TEXT, Field.FieldRole.DIMENSION, Long.valueOf(2)));

    dataSourceRepository.saveAndFlush(savedDataSource);
    System.out.println(ToStringBuilder.reflectionToString(savedDataSource, ToStringStyle.MULTI_LINE_STYLE));

    DataSource updatedDataSource = dataSourceRepository.findByIdIncludeChild(dataSource.getId());
    System.out.println("UPDATE:: " + ToStringBuilder.reflectionToString(updatedDataSource, ToStringStyle.MULTI_LINE_STYLE));

  }

  @Test
  public void findDataSource() {
    System.out.println(ToStringBuilder.reflectionToString(dataSourceRepository.findByIdIncludeChild("ds-10"), ToStringStyle.MULTI_LINE_STYLE));
  }

  @Test
  public void findDataSourceByLookupType() {
    // 초기 데이터 활용
    //
    List<DataSource> dataSources = dataSourceRepository.findByDsType(DataSource.DataSourceType.JOIN);

    assertNotNull(dataSources);
    assertTrue(dataSources.size() > 0);

    dataSources.forEach((d) -> System.out.println(d));

  }

  @Test
  public void finDataSourceList() {

    DataSource dataSource = new DataSource();
    dataSource.setName("test");

    dataSourceRepository.save(dataSource);

    List<DataSource> dataSourceList = dataSourceRepository.findAllIncludeChild();

    for (DataSource ds : dataSourceList) {
      System.out.println("Result:: " + ToStringBuilder.reflectionToString(ds, ToStringStyle.MULTI_LINE_STYLE));
    }

    Assert.assertTrue(dataSourceList.size() > 0);

  }

  @Test
  public void findByFieldByDataSourceIds() {

    List<String> dsIds = Lists.newArrayList("ds-17", "ds-18");

    List<DataSource> resultFields = dataSourceRepository.findByDataSourceMultipleIds(dsIds);

    System.out.println(resultFields.size());
//    System.out.println(resultFields);

  }

  @Test
  @Sql({"/sql/test_datasource_filter.sql"})
  public void findDistinctCreatedByExcludeVolatility(){

    List<DataSource> dataSources = dataSourceRepository.findAll();
    List<String> volatilityCreatorList = new ArrayList<>();
    for(DataSource ds : dataSources){
      if(ds.getDsType() == DataSource.DataSourceType.VOLATILITY){
        if(!volatilityCreatorList.contains(ds.getCreatedBy())){
          volatilityCreatorList.add(ds.getCreatedBy());
        }
      } else {
        if(volatilityCreatorList.contains(ds.getCreatedBy())){
          volatilityCreatorList.remove(ds.getCreatedBy());
        }
      }
    }

    System.out.println("volatilityCreatorList = " + volatilityCreatorList);

    List<String> creatorList = dataSourceRepository.findDistinctCreatedBy(DataSource.DataSourceType.MASTER, DataSource.DataSourceType.JOIN);
    for(String createdBy : creatorList){
      System.out.println("createdBy = " + createdBy);
      Assert.assertTrue(!volatilityCreatorList.contains(createdBy));
    }
  }

}
