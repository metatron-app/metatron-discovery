package app.metatron.discovery.domain.workbench;

import org.junit.Test;

/**
 *
 */
public class HiveQueryLogThreadTest {

  @Test
  public void parseLogToProgressTest() throws Exception{

    HiveQueryLogThread hiveThread = new HiveQueryLogThread(null, null, null, 0, "qe_1", 0L, null);
    String commonLog1 = "INFO : Map 1: 0(+1)/1\tMap 4: 1/1\tReducer 2: 0/2\tReducer 3: 0/1";
    String commonLog2 = "18/08/07 05:14:33 INFO monitoring.RenderStrategy$LogToFileFunction: Map 1: 0/1\tMap 4: 0/1\tReducer 2: 0/2\tReducer 3: 0/1";

    //set hive.server2.in.place.progress=false;

    boolean bool1 = hiveThread.isProgressIndicatedLog(commonLog1);
    System.out.println("bool1 = " + bool1);
    boolean bool2 = hiveThread.isProgressIndicatedLog(commonLog2);
    System.out.println("bool2 = " + bool2);
  }


}
