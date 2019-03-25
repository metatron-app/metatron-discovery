package app.metatron.discovery.domain.workbench;

import org.apache.commons.lang3.StringUtils;
import org.junit.Assert;
import org.junit.Test;

/**
 *
 */
public class VerticesProgressTest {

  @Test
  public void parseLogToProgressTest(){


    String completeTotalLog = "Map 1: 10/21";
    String completeRunningFailTotalLog = "Map 1: 1(+2,-3)/4";
    String completeRunningTotalLog = "Reducer 2: 1(+2)/3";
    String completeFailedTotalLog = "Reducer 3: 11(-12)/13";

    VerticesProgress progress1 = new VerticesProgress(completeTotalLog);
    System.out.println("progress1 = " + progress1);
    Assert.assertEquals(10, progress1.getComplete().intValue());
    Assert.assertEquals(0, progress1.getRunning().intValue());
    Assert.assertEquals(0, progress1.getFailed().intValue());
    Assert.assertEquals(21, progress1.getTotal().intValue());

    VerticesProgress progress2 = new VerticesProgress(completeRunningFailTotalLog);
    System.out.println("progress2 = " + progress2);
    Assert.assertEquals(1, progress2.getComplete().intValue());
    Assert.assertEquals(2, progress2.getRunning().intValue());
    Assert.assertEquals(3, progress2.getFailed().intValue());
    Assert.assertEquals(4, progress2.getTotal().intValue());

    VerticesProgress progress3 = new VerticesProgress(completeRunningTotalLog);
    System.out.println("progress3 = " + progress3);
    Assert.assertEquals(1, progress3.getComplete().intValue());
    Assert.assertEquals(2, progress3.getRunning().intValue());
    Assert.assertEquals(0, progress3.getFailed().intValue());
    Assert.assertEquals(3, progress3.getTotal().intValue());

    VerticesProgress progress4 = new VerticesProgress(completeFailedTotalLog);
    System.out.println("progress4 = " + progress4);
    Assert.assertEquals(11, progress4.getComplete().intValue());
    Assert.assertEquals(0, progress4.getRunning().intValue());
    Assert.assertEquals(12, progress4.getFailed().intValue());
    Assert.assertEquals(13, progress4.getTotal().intValue());
  }

  @Test
  public void parseLogToProgressTest2(){


    String commonLogNone1 = "INFO : CONNECTION: 0";
    String commonLogNone2= "18/08/28 05:52:31 INFO QueueHandler: Audit Post Hook (S)";
    String commonLogVerbose = "18/08/07 05:14:33 INFO monitoring.RenderStrategy$LogToFileFunction: Map 1: 0/1\tMap 4: 1/1\tReducer 2: 0/2\tReducer 3: 0/1";
    String commonLogExecution = "INFO : Map 1: 0(+1)/1\tMap 4: 1/1\tReducer 2: 2/2\tReducer 3: 0/1";
    String commonLogPerformance = "INFO : Map 1: 0(-1)/1\tMap 4: 1/1\tReducer 2: 0/2\tReducer 3: 1/1";

    VerticesProgress progress1 = new VerticesProgress(commonLogNone2);
    System.out.println("progress1 = " + progress1);
    Assert.assertEquals(0, progress1.getComplete().intValue());
    Assert.assertEquals(0, progress1.getRunning().intValue());
    Assert.assertEquals(0, progress1.getFailed().intValue());
    Assert.assertEquals(0, progress1.getTotal().intValue());
    Assert.assertEquals(false, progress1.isProgressIndicated());
    Assert.assertEquals(0, progress1.getProgress().intValue());

    VerticesProgress progress2 = new VerticesProgress(commonLogVerbose);
    System.out.println("progressVervbose = " + progress2);
    Assert.assertEquals(1, progress2.getComplete().intValue());
    Assert.assertEquals(0, progress2.getRunning().intValue());
    Assert.assertEquals(0, progress2.getFailed().intValue());
    Assert.assertEquals(5, progress2.getTotal().intValue());
    Assert.assertEquals(true, progress2.isProgressIndicated());
    Assert.assertEquals(20, progress2.getProgress().intValue());

    VerticesProgress progress3 = new VerticesProgress(commonLogExecution);
    System.out.println("progressExecution = " + progress3);
    Assert.assertEquals(3, progress3.getComplete().intValue());
    Assert.assertEquals(1, progress3.getRunning().intValue());
    Assert.assertEquals(0, progress3.getFailed().intValue());
    Assert.assertEquals(5, progress3.getTotal().intValue());
    Assert.assertEquals(true, progress3.isProgressIndicated());
    Assert.assertEquals(60, progress3.getProgress().intValue());

    VerticesProgress progress4 = new VerticesProgress(commonLogPerformance);
    System.out.println("progressPerformance = " + progress4);
    Assert.assertEquals(2, progress4.getComplete().intValue());
    Assert.assertEquals(0, progress4.getRunning().intValue());
    Assert.assertEquals(1, progress4.getFailed().intValue());
    Assert.assertEquals(5, progress4.getTotal().intValue());
    Assert.assertEquals(true, progress4.isProgressIndicated());
    Assert.assertEquals(40, progress4.getProgress().intValue());
  }

  @Test
  public void splitTest(){

    String log = "18/08/07 05:14:42 INFO monitoring.RenderStrategy$LogToFileFunction: Map 1: 0(+1)/1\tMap 4: 1/1\tReducer 2: 0/2\tReducer 3: 0/1\t";
    String[] splitLogs = StringUtils.splitByWholeSeparator(log, "LogToFileFunction: ");
    for(String splitLog : splitLogs){
      System.out.println(splitLog);
    }
  }
}
