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

package app.metatron.discovery.domain.datasource.data.result;

import com.fasterxml.jackson.databind.JsonNode;

import org.junit.Test;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.MatrixResponse;
import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.domain.datasource.data.SearchQueryRequest;

public class ObjectResultFormatTest {

  @Test
  public void toResultSetByMatrixType() {
    String jsonResult = "[ {\n" +
        "  \"timestamp\" : \"2018-07-04T09:00:00.000Z\",\n" +
        "  \"result\" : {\n" +
        "    \"pagingIdentifiers\" : {\n" +
        "      \"fifa_18_player_ratings_2018-07-01T00:00:00.000Z_2018-08-01T00:00:00.000Z_2018-07-04T09:00:30.327Z\" : 2\n" +
        "    },\n" +
        "    \"events\" : [ {\n" +
        "      \"segmentId\" : \"fifa_18_player_ratings_2018-07-01T00:00:00.000Z_2018-08-01T00:00:00.000Z_2018-07-04T09:00:30.327Z\",\n" +
        "      \"offset\" : 0,\n" +
        "      \"event\" : {\n" +
        "        \"timestamp\" : 1530694800000,\n" +
        "        \"Name\" : \"G. Zuiverloon\",\n" +
        "        \"Age\" : \"30\",\n" +
        "        \"Nationality\" : \"Suriname\",\n" +
        "        \"Club\" : \"C.D. Leonesa S.A.D.\",\n" +
        "        \"Wage_Euro_\" : 6000.0,\n" +
        "        \"Value_Euro_\" : 1300000.0\n" +
        "      }\n" +
        "    }, {\n" +
        "      \"segmentId\" : \"fifa_18_player_ratings_2018-07-01T00:00:00.000Z_2018-08-01T00:00:00.000Z_2018-07-04T09:00:30.327Z\",\n" +
        "      \"offset\" : 1,\n" +
        "      \"event\" : {\n" +
        "        \"timestamp\" : 1530694800000,\n" +
        "        \"Name\" : \"K. Leerdam\",\n" +
        "        \"Age\" : \"27\",\n" +
        "        \"Nationality\" : \"Suriname\",\n" +
        "        \"Club\" : \"Seattle Sounders FC\",\n" +
        "        \"Wage_Euro_\" : 6000.0,\n" +
        "        \"Value_Euro_\" : 1600000.0\n" +
        "      }\n" +
        "    }, {\n" +
        "      \"segmentId\" : \"fifa_18_player_ratings_2018-07-01T00:00:00.000Z_2018-08-01T00:00:00.000Z_2018-07-04T09:00:30.327Z\",\n" +
        "      \"offset\" : 2,\n" +
        "      \"event\" : {\n" +
        "        \"timestamp\" : 1530694800000,\n" +
        "        \"Name\" : \"R. Alberg\",\n" +
        "        \"Age\" : \"26\",\n" +
        "        \"Nationality\" : \"Suriname\",\n" +
        "        \"Club\" : \"Philadelphia Union\",\n" +
        "        \"Wage_Euro_\" : 5000.0,\n" +
        "        \"Value_Euro_\" : 950000.0\n" +
        "      }\n" +
        "    } ]\n" +
        "  }\n" +
        "} ]";

    ObjectResultFormat objectResultFormat = new ObjectResultFormat();
    objectResultFormat.setRequest(new SearchQueryRequest());
    objectResultFormat.setConnType(DataSource.ConnectionType.ENGINE);
    objectResultFormat.setResultType(SearchResultFormat.ResultType.MATRIX);

    MatrixResponse response = (MatrixResponse) objectResultFormat.makeResult(GlobalObjectMapper.readValue(jsonResult, JsonNode.class));

    System.out.println(GlobalObjectMapper.writeValueAsString(response));
  }
}
