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

package app.metatron.discovery.query.druid;


import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.Test;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import javax.validation.ConstraintViolation;
import javax.validation.Validation;
import javax.validation.Validator;
import javax.validation.ValidatorFactory;

import app.metatron.discovery.query.druid.aggregations.CountAggregation;
import app.metatron.discovery.query.druid.granularities.DurationGranularity;
import app.metatron.discovery.query.druid.queries.TimeseriesQuery;

import static junit.framework.TestCase.assertEquals;


public class QueryTest {
  @Test
  public void testTimeseriesQuery() throws IOException {


//    Granularity granularity = new SimpleGranularity("all");
    Granularity granularity = new DurationGranularity("3md", "aaaa");
    List<String> intervals = new ArrayList<>();
    intervals.add("2012-01-01T00:00:00.000/2012-01-03T00:00:00.000");

    Aggregation aggregation = new CountAggregation("aaa");
    List<Aggregation> aggregations = new ArrayList<>();
    aggregations.add(aggregation);

    Query query = new TimeseriesQuery("wikipedia", granularity, intervals, null, aggregations, null);

    ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
    Validator validator = factory.getValidator();
    Set<ConstraintViolation<Query>> constraintViolations = validator.validate(query);

    assertEquals(0, constraintViolations.size());

//    System.out.println(constraintViolations.iterator().next().getMessage());
    ObjectMapper mapper = new ObjectMapper();
    String jsonInString = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(query);
    System.out.println(jsonInString);



/*


    // Post Request Test

    String USER_AGENT = "Mozilla/5.0";
    //String url = "https://selfsolve.apple.com/wcResults.do";
    String url = "http://127.0.0.1:8082/druid/v2/";
    URL obj;
    obj = new URL(url);
    HttpURLConnection con = (HttpURLConnection) obj.openConnection();

    //add reuqest header
    con.setRequestMethod("POST");
    //con.setRequestProperty("User-Agent", USER_AGENT);
    //con.setRequestProperty("Accept-Language", "en-US,en;q=0.5");
    con.setRequestProperty("content-type", "application/json");

    //String urlParameters = "sn=C02G8416DRJM&cn=&locale=&caller=&num=12345";
    String urlParameters = "{\n" +
            "   \"queryType\": \"select\",\n" +
            "   \"dataSource\": \"fdc_pm2_summary_04\",\n" +
            "   \"dimensions\":[],\n" +
            "   \"metrics\":[],\n" +
            "   \"granularity\": \"all\",\n" +
            "   \"intervals\": [ \"2010-01-01/2020-01-01\" ],\n" +
            "   \"pagingSpec\":{\"pagingIdentifiers\": {}, \"threshold\":10}\n" +
            " }";

    // Send post request
    con.setDoOutput(true);
    DataOutputStream wr = new DataOutputStream(con.getOutputStream());
    wr.writeBytes(urlParameters);
    wr.flush();
    wr.close();

    int responseCode = con.getResponseCode();
    System.out.println("\nSending 'POST' request to URL : " + url);
    System.out.println("Post parameters : " + urlParameters);
    System.out.println("Response Code : " + responseCode);

    BufferedReader in = new BufferedReader(
            new InputStreamReader(con.getInputStream()));
    String inputLine;
    StringBuffer response = new StringBuffer();

    while ((inputLine = in.readLine()) != null) {
      response.append(inputLine);
    }
    in.close();

    //print result
    System.out.println(response.toString());

    ObjectMapper mapper = new ObjectMapper();
    JsonNode root = mapper.readTree(response.toString());

    if ( root.isArray() ){
      System.out.println("is array \n");

      for (final JsonNode objNode : root) {

        JsonNode objEventArray = objNode.get( "result").get("events");

        for (final JsonNode objEvent : objEventArray) {

          System.out.println(objEvent);
        }
      }
    }

    for (int i = 0; i < root.size(); i++) {
      System.out.printf("test %d%n", i);
      System.out.println(root.get(i).asText());
    }
  */

  }
}
