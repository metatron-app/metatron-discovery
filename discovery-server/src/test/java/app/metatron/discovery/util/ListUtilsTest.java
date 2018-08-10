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

package app.metatron.discovery.util;

import org.junit.Test;

import java.util.ArrayList;
import java.util.List;

import app.metatron.discovery.domain.datalineage.DataLineageLinkedEdge;

public class ListUtilsTest {

  @Test
  public void distinctListByKeys(){
    List<DataLineageLinkedEdge> edgeList = new ArrayList<>();
    DataLineageLinkedEdge dataLineageLinkedEdge;

    dataLineageLinkedEdge = new DataLineageLinkedEdge();
    dataLineageLinkedEdge.setFromTable("fromTable1");
    dataLineageLinkedEdge.setFromColumn("fromCol1");
    dataLineageLinkedEdge.setToTable("toTable1");
    dataLineageLinkedEdge.setToColumn("toCol1");
    dataLineageLinkedEdge.setPath("edge1");
    edgeList.add(dataLineageLinkedEdge);

    dataLineageLinkedEdge = new DataLineageLinkedEdge();
    dataLineageLinkedEdge.setFromTable("fromTable1");
    dataLineageLinkedEdge.setFromColumn("fromCol2");
    dataLineageLinkedEdge.setToTable("toTable1");
    dataLineageLinkedEdge.setToColumn("toCol2");
    dataLineageLinkedEdge.setPath("edge1");
    edgeList.add(dataLineageLinkedEdge);

    dataLineageLinkedEdge = new DataLineageLinkedEdge();
    dataLineageLinkedEdge.setFromTable("fromTable1");
    dataLineageLinkedEdge.setFromColumn("fromCol3");
    dataLineageLinkedEdge.setToTable("toTable1");
    dataLineageLinkedEdge.setToColumn("toCol3");
    dataLineageLinkedEdge.setPath("edge1");
    edgeList.add(dataLineageLinkedEdge);


    dataLineageLinkedEdge = new DataLineageLinkedEdge();
    dataLineageLinkedEdge.setFromTable("fromTable2");
    dataLineageLinkedEdge.setFromColumn("fromCol1");
    dataLineageLinkedEdge.setToTable("toTable1");
    dataLineageLinkedEdge.setToColumn("toCol4");
    dataLineageLinkedEdge.setPath("edge1");
    edgeList.add(dataLineageLinkedEdge);

    dataLineageLinkedEdge = new DataLineageLinkedEdge();
    dataLineageLinkedEdge.setFromTable("fromTable2");
    dataLineageLinkedEdge.setFromColumn("fromCol2");
    dataLineageLinkedEdge.setToTable("toTable1");
    dataLineageLinkedEdge.setToColumn("toCol5");
    dataLineageLinkedEdge.setPath("edge1");
    edgeList.add(dataLineageLinkedEdge);

    dataLineageLinkedEdge = new DataLineageLinkedEdge();
    dataLineageLinkedEdge.setFromTable("fromTable2");
    dataLineageLinkedEdge.setFromColumn("fromCol3");
    dataLineageLinkedEdge.setToTable("toTable1");
    dataLineageLinkedEdge.setToColumn("toCol6");
    dataLineageLinkedEdge.setPath("edge1");
    edgeList.add(dataLineageLinkedEdge);

    dataLineageLinkedEdge = new DataLineageLinkedEdge();
    dataLineageLinkedEdge.setFromTable("toTable1");
    dataLineageLinkedEdge.setFromColumn("toCol1");
    dataLineageLinkedEdge.setToTable("totoTable1");
    dataLineageLinkedEdge.setToColumn("totoCol1");
    dataLineageLinkedEdge.setPath("edge2");
    edgeList.add(dataLineageLinkedEdge);

    dataLineageLinkedEdge = new DataLineageLinkedEdge();
    dataLineageLinkedEdge.setFromTable("toTable1");
    dataLineageLinkedEdge.setFromColumn("toCol2");
    dataLineageLinkedEdge.setToTable("totoTable1");
    dataLineageLinkedEdge.setToColumn("totoCol2");
    dataLineageLinkedEdge.setPath("edge2");
    edgeList.add(dataLineageLinkedEdge);

    List<DataLineageLinkedEdge> distincted = ListUtils.distinctList(edgeList, DataLineageLinkedEdge::getFromTable,
            DataLineageLinkedEdge::getToTable, DataLineageLinkedEdge::getPath);

    System.out.println("=======edgeList=====");
    for(DataLineageLinkedEdge linkedEdge : edgeList){
      System.out.println(linkedEdge.getFromTable() + " -> " + linkedEdge.getToTable() + " via : " + linkedEdge.getPath());
    }

    System.out.println("=======distincted=====");
    for(DataLineageLinkedEdge linkedEdge : distincted){
      System.out.println(linkedEdge.getFromTable() + " -> " + linkedEdge.getToTable() + " via : " + linkedEdge.getPath());
    }
  }
}
