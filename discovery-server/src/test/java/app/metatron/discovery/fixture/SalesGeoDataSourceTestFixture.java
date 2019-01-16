package app.metatron.discovery.fixture;

import app.metatron.discovery.TestEngineIngestion;

public class SalesGeoDataSourceTestFixture {

  public static void setUp(final String engineDataSourceName) throws InterruptedException {
    final TestEngineIngestion testEngineIngestion = new TestEngineIngestion();

    final String workerHost = testEngineIngestion.getEngineWorkerHost();
    final String baseDir = SalesGeoDataSourceTestFixture.class.getResource("/ingestion/").getPath();
    final String filter = "sales_geo.csv";

    final String ingestionSpec = "{\n" +
        "  \"context\": {\n" +
        "    \"druid.task.runner.dedicated.host\": \"" + workerHost + "\"\n" +
        "  },\n" +
        "  \"spec\": {\n" +
        "    \"dataSchema\": {\n" +
        "      \"dataSource\": \"" + engineDataSourceName + "\",\n" +
        "      \"granularitySpec\": {\n" +
        "        \"intervals\": [\n" +
        "          \"1970-01-01/2050-01-01\"\n" +
        "        ],\n" +
        "        \"queryGranularity\": \"DAY\",\n" +
        "        \"rollup\": true,\n" +
        "        \"segmentGranularity\": \"MONTH\",\n" +
        "        \"type\": \"uniform\"\n" +
        "      },\n" +
        "      \"metricsSpec\": [\n" +
        "        {\n" +
        "          \"name\": \"count\",\n" +
        "          \"type\": \"count\"\n" +
        "        },\n" +
        "        {\n" +
        "          \"fieldName\": \"Discount\",\n" +
        "          \"inputType\": \"double\",\n" +
        "          \"name\": \"Discount\",\n" +
        "          \"type\": \"sum\"\n" +
        "        },\n" +
        "        {\n" +
        "          \"fieldName\": \"Profit\",\n" +
        "          \"inputType\": \"double\",\n" +
        "          \"name\": \"Profit\",\n" +
        "          \"type\": \"sum\"\n" +
        "        },\n" +
        "        {\n" +
        "          \"fieldName\": \"Sales\",\n" +
        "          \"inputType\": \"double\",\n" +
        "          \"name\": \"Sales\",\n" +
        "          \"type\": \"sum\"\n" +
        "        },\n" +
        "        {\n" +
        "          \"fieldName\": \"DaystoShipActual\",\n" +
        "          \"inputType\": \"double\",\n" +
        "          \"name\": \"DaystoShipActual\",\n" +
        "          \"type\": \"sum\"\n" +
        "        },\n" +
        "        {\n" +
        "          \"fieldName\": \"SalesForecast\",\n" +
        "          \"inputType\": \"double\",\n" +
        "          \"name\": \"SalesForecast\",\n" +
        "          \"type\": \"sum\"\n" +
        "        },\n" +
        "        {\n" +
        "          \"fieldName\": \"DaystoShipScheduled\",\n" +
        "          \"inputType\": \"double\",\n" +
        "          \"name\": \"DaystoShipScheduled\",\n" +
        "          \"type\": \"sum\"\n" +
        "        },\n" +
        "        {\n" +
        "          \"fieldName\": \"SalesperCustomer\",\n" +
        "          \"inputType\": \"double\",\n" +
        "          \"name\": \"SalesperCustomer\",\n" +
        "          \"type\": \"sum\"\n" +
        "        },\n" +
        "        {\n" +
        "          \"fieldName\": \"ProfitRatio\",\n" +
        "          \"inputType\": \"double\",\n" +
        "          \"name\": \"ProfitRatio\",\n" +
        "          \"type\": \"sum\"\n" +
        "        }\n" +
        "      ],\n" +
        "      \"parser\": {\n" +
        "        \"columns\": [\n" +
        "          \"OrderDate\",\n" +
        "          \"Category\",\n" +
        "          \"City\",\n" +
        "          \"Country\",\n" +
        "          \"CustomerName\",\n" +
        "          \"Discount\",\n" +
        "          \"OrderID\",\n" +
        "          \"PostalCode\",\n" +
        "          \"ProductName\",\n" +
        "          \"Profit\",\n" +
        "          \"Quantity\",\n" +
        "          \"Region\",\n" +
        "          \"Sales\",\n" +
        "          \"Segment\",\n" +
        "          \"ShipDate\",\n" +
        "          \"ShipMode\",\n" +
        "          \"State\",\n" +
        "          \"Sub-Category\",\n" +
        "          \"DaystoShipActual\",\n" +
        "          \"SalesForecast\",\n" +
        "          \"ShipStatus\",\n" +
        "          \"DaystoShipScheduled\",\n" +
        "          \"OrderProfitable\",\n" +
        "          \"SalesperCustomer\",\n" +
        "          \"ProfitRatio\",\n" +
        "          \"SalesaboveTarget\",\n" +
        "          \"latitude\",\n" +
        "          \"longitude\",\n" +
        "          \"location\"\n" +
        "        ],\n" +
        "        \"delimiter\": \",\",\n" +
        "        \"dimensionsSpec\": {\n" +
        "          \"dimensionExclusions\": [],\n" +
        "          \"dimensions\": [\n" +
        "            \"Category\",\n" +
        "            \"City\",\n" +
        "            \"Country\",\n" +
        "            \"CustomerName\",\n" +
        "            \"OrderID\",\n" +
        "            \"PostalCode\",\n" +
        "            \"ProductName\",\n" +
        "            \"Quantity\",\n" +
        "            \"Region\",\n" +
        "            \"Segment\",\n" +
        "            \"ShipDate\",\n" +
        "            \"ShipMode\",\n" +
        "            \"State\",\n" +
        "            \"Sub-Category\",\n" +
        "            \"ShipStatus\",\n" +
        "            \"OrderProfitable\",\n" +
        "            \"SalesaboveTarget\",\n" +
        "            \"latitude\",\n" +
        "            \"longitude\",\n" +
        "            \"location\"\n" +
        "          ],\n" +
        "          \"spatialDimensions\": []\n" +
        "        },\n" +
        "        \"skipHeaderRecord\": true,\n" +
        "        \"timestampSpec\": {\n" +
        "          \"column\": \"OrderDate\",\n" +
        "          \"format\": \"yyyy-MM-dd HH:mm:ss\",\n" +
        "          \"invalidValue\": \"2018-12-18T08:06:57.243Z\",\n" +
        "          \"missingValue\": \"2018-12-18T08:06:57.243Z\",\n" +
        "          \"replaceWrongColumn\": true\n" +
        "        },\n" +
        "        \"type\": \"csv.stream\"\n" +
        "      }\n" +
        "    },\n" +
        "    \"ioConfig\": {\n" +
        "      \"firehose\": {\n" +
        "        \"baseDir\": \"" + baseDir + "\",\n" +
        "        \"filter\": \"" + filter + "\",\n" +
        "        \"type\": \"local\"\n" +
        "      },\n" +
        "      \"type\": \"index\"\n" +
        "    },\n" +
        "    \"tuningConfig\": {\n" +
        "      \"buildV9Directly\": true,\n" +
        "      \"ignoreInvalidRows\": true,\n" +
        "      \"maxRowsInMemory\": 75000,\n" +
        "      \"type\": \"index\"\n" +
        "    }\n" +
        "  },\n" +
        "  \"type\": \"index\"\n" +
        "}";

    testEngineIngestion.ingestionLocalFile(engineDataSourceName, ingestionSpec);

  }
}
