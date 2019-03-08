/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specic language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.common.geospatial.geojson;

import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

import org.junit.Test;

import app.metatron.discovery.common.GlobalObjectMapper;

public class GeoJsonWriterTest {

  //  @Test
  //  public void WktToGeometry() throws ParseException {
  //    String wkt = "POINT (100 90)";
  //    Shape shape = ((WKTReader) JtsSpatialContext.GEO.getFormats().getWktReader()).parse(wkt);
  //    System.out.println(shape);
  //
  //    wkt = "LINESTRING (1 10, 2 20, 3 30)";
  //    shape = ((WKTReader) JtsSpatialContext.GEO.getFormats().getWktReader()).parse(wkt);
  //    System.out.println(shape);
  //
  //    wkt = "POLYGON ((100.1 0.1, 101.1 0.1, 101.1 1.1, 100.1 1.1, 100.1 0.1))";
  //    shape = ((WKTReader) JtsSpatialContext.GEO.getFormats().getWktReader()).parse(wkt);
  //    System.out.println(shape);
  //
  //  }

  @Test
  public void write() {

    ArrayNode arrayNode = GlobalObjectMapper.getDefaultMapper().createArrayNode();
    ObjectNode geoNode1 = GlobalObjectMapper.getDefaultMapper().createObjectNode();
    geoNode1.put("geometry", "POINT (100 90)");
    arrayNode.add(geoNode1);

    ObjectNode geoNode2 = GlobalObjectMapper.getDefaultMapper().createObjectNode();
    geoNode2.put("geometry", "LINESTRING (1 10, 2 20, 3 30)");
    arrayNode.add(geoNode2);

    ObjectNode geoNode3 = GlobalObjectMapper.getDefaultMapper().createObjectNode();
    geoNode3.put("geometry", "POLYGON ((100.1 0.1, 101.1 0.1, 101.1 1.1, 100.1 1.1, 100.1 0.1))");
    arrayNode.add(geoNode3);


    GeoJson geoJson = new GeoJsonWriter().write(arrayNode);

    System.out.println(GlobalObjectMapper.writeValueAsString(geoJson));

  }

}