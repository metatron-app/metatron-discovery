package app.metatron.discovery.domain.dataconnection;

import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.jdbc.Sql;

import java.util.List;

import javax.persistence.EntityManager;

import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.domain.datasource.DataSourceRepository;
import app.metatron.discovery.domain.datasource.connection.jdbc.JdbcConnectionService;
import app.metatron.discovery.extension.dataconnection.jdbc.accessor.JdbcAccessor;

/**
 *
 */
public class DataConnectionRepositoryTest {

  @Autowired
  DataConnectionRepository dataConnectionRepository;

  @Autowired
  DataSourceRepository dataSourceRepository;

  @Autowired
  EntityManager entityManager;

  @Autowired
  JdbcConnectionService jdbcConnectionService;

  @Test
  public void impleTypeTest(){
//    DataConnection oracleConnection = new DataConnection();
//    oracleConnection.setSid("11");
//    oracleConnection.setName("oracleconn");
//    oracleConnection.setImplementor("ORACLE");
//    DataConnection savedOracl = dataConnectionRepository.saveAndFlush(oracleConnection);
//
//    DataConnection hiveConnection = new DataConnection();
//    hiveConnection.setName("hiveconn");
//    hiveConnection.setImplementor("HIVE");
//    DataConnection savedHive = dataConnectionRepository.saveAndFlush(hiveConnection);
//
//    HdfsConnection hdfsFileConnection = new HdfsConnection();
//    hdfsFileConnection.setName("hdfs conn");
//    HdfsConnection savedHdfs = dataConnectionRepository.saveAndFlush(hdfsFileConnection);
//
//    entityManager.flush();
//
//    List<DataConnection> list = dataConnectionRepository.findAll();
//    for(DataConnection dc : list){
//      System.out.println(dc.toString());
//    }
  }

  @Test
  public void repoTest(){
    List<DataSource> list = dataSourceRepository.findAll();
    System.out.println(list);
  }

  @Test
  @Sql("/sql/test_dataconnection.sql")
  public void oldDcTest(){
    List<DataConnection> list = dataConnectionRepository.findAll();

    for(DataConnection dc : list){
      System.out.println(dc.getImplementor() + "-" + dc.getClass().getName());
    }
  }

  @Test
  public void connectorTest(){
    DataConnection mysqlConnInfo = new DataConnection("MYSQL");
    mysqlConnInfo.setName("mysqlConnInfo");
    mysqlConnInfo.setHostname("localhost");
    mysqlConnInfo.setPort(3306);
    mysqlConnInfo.setUsername("polaris");
    mysqlConnInfo.setPassword("polaris");

    JdbcAccessor jdbcAccessor = DataConnectionHelper.getAccessor(mysqlConnInfo);
    System.out.println(jdbcAccessor.checkConnection());

  }
}
