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

package app.metatron.discovery.domain.datasource.data;

import com.fasterxml.jackson.databind.JsonNode;

import org.junit.Test;

import app.metatron.discovery.common.GlobalObjectMapper;

/**
 * Created by kyungtaak on 2017. 6. 5..
 */
public class CandidateQueryRequestTest {


  @Test
  public void makeResult() throws Exception {
    String result = "[ {\n" +
        "  \"id\" : \"merged\",\n" +
        "  \"intervals\" : null,\n" +
        "  \"columns\" : {\n" +
        "    \"construct_day\" : {\n" +
        "      \"type\" : \"STRING\",\n" +
        "      \"hasMultipleValues\" : false,\n" +
        "      \"size\" : 0,\n" +
        "      \"serializedSize\" : 0,\n" +
        "      \"cardinality\" : null,\n" +
        "      \"nullCount\" : null,\n" +
        "      \"minValue\" : \"20161205\",\n" +
        "      \"maxValue\" : \"\\\\N\",\n" +
        "      \"errorMessage\" : null\n" +
        "    }\n" +
        "  },\n" +
        "  \"size\" : 0,\n" +
        "  \"serializedSize\" : 0,\n" +
        "  \"numRows\" : 447628,\n" +
        "  \"ingestedNumRows\" : -1,\n" +
        "  \"lastAccessTime\" : -1,\n" +
        "  \"aggregators\" : null,\n" +
        "  \"queryGranularity\" : null,\n" +
        "  \"rollup\" : null\n" +
        "} ]";


    JsonNode root = GlobalObjectMapper.getDefaultMapper().readValue(result, JsonNode.class);

    CandidateQueryRequest candidateQueryRequest = new CandidateQueryRequest();

    System.out.println(GlobalObjectMapper.writeValueAsString(candidateQueryRequest.makeResult(root)));


  }

  @Test
  public void extractNumberNodeObjectCase() throws Exception {
    String result = "[\n" +
        "    {\n" +
        "        \"id\": \"merged\",\n" +
        "        \"intervals\": null,\n" +
        "        \"columns\": {\n" +
        "            \"Sales\": {\n" +
        "                \"type\": \"float\",\n" +
        "                \"hasMultipleValues\": false,\n" +
        "                \"serializedSize\": -1,\n" +
        "                \"cardinality\": -1,\n" +
        "                \"nullCount\": -1,\n" +
        "                \"minValue\": {\n" +
        "                    \"Float\": 0\n" +
        "                },\n" +
        "                \"maxValue\": {\n" +
        "                    \"Float\": 22638\n" +
        "                },\n" +
        "                \"errorMessage\": null\n" +
        "            }\n" +
        "        },\n" +
        "        \"serializedSize\": -1,\n" +
        "        \"numRows\": 9993,\n" +
        "        \"ingestedNumRows\": -1,\n" +
        "        \"lastAccessTime\": -1,\n" +
        "        \"aggregators\": null,\n" +
        "        \"queryGranularity\": null,\n" +
        "        \"segmentGranularity\": null,\n" +
        "        \"rollup\": null\n" +
        "    }\n" +
        "]";


    JsonNode root = GlobalObjectMapper.getDefaultMapper().readValue(result, JsonNode.class);

    CandidateQueryRequest candidateQueryRequest = new CandidateQueryRequest();

    System.out.println(candidateQueryRequest.extractNumberNode(root.get(0).get("columns").get("Sales").get("maxValue")));

  }

  @Test
  public void extractNumberNodeNumberCase() throws Exception {
    String result = "[\n" +
        "  {\n" +
        "    \"id\": \"merged\",\n" +
        "    \"intervals\": null,\n" +
        "    \"columns\": {\n" +
        "      \"Sales\": {\n" +
        "        \"type\": \"double\",\n" +
        "        \"hasMultipleValues\": false,\n" +
        "        \"serializedSize\": -1,\n" +
        "        \"cardinality\": -1,\n" +
        "        \"nullCount\": -1,\n" +
        "        \"minValue\": 0.0,\n" +
        "        \"maxValue\": 22638.0,\n" +
        "        \"errorMessage\": null\n" +
        "      }\n" +
        "    },\n" +
        "    \"serializedSize\": -1,\n" +
        "    \"numRows\": 9994,\n" +
        "    \"ingestedNumRows\": -1,\n" +
        "    \"lastAccessTime\": -1,\n" +
        "    \"aggregators\": null,\n" +
        "    \"queryGranularity\": null,\n" +
        "    \"segmentGranularity\": null,\n" +
        "    \"rollup\": null\n" +
        "  }\n" +
        "]";


    JsonNode root = GlobalObjectMapper.getDefaultMapper().readValue(result, JsonNode.class);

    CandidateQueryRequest candidateQueryRequest = new CandidateQueryRequest();

    System.out.println(candidateQueryRequest.extractNumberNode(root.get(0).get("columns").get("Sales").get("maxValue")));


  }

}
