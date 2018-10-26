package app.metatron.discovery;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.concurrent.TimeUnit;

public class TestEngineIngestion {
  final RestTemplate restTemplate = new RestTemplate();

  public void ingestionLocalFile(final String engineDataSourceName, final String ingestionSpec) throws InterruptedException {
    // 기존에 있다면 삭제..
    restTemplate.delete("http://localhost:8081/druid/coordinator/v1/datasources/" + engineDataSourceName);

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    HttpEntity<String> entity = new HttpEntity<>(ingestionSpec, headers);

    Map<String, Object> response = restTemplate.postForObject("http://localhost:8090/druid/indexer/v1/task", entity, Map.class);
    String taskId = (String)response.get("task");

    final int MAX = 10;
    int i = 0;
    while(true) {
      waitCurrentThread(2);
      if(i < MAX) {
        String status = getTaskStatus(taskId);
        if(status.equals("SUCCESS")) {
          break;
        } else if(status.equals("FAILED")) {
          throw new RuntimeException("FAILED ingestion");
        }
      } else {
        throw new RuntimeException("TIMEOUT ingestion");
      }

      i++;
    }
  }

  private String getTaskStatus(String taskId) {
    Map<String, Object> taskStatus = restTemplate.getForObject("http://localhost:8090/druid/indexer/v1/task/" + taskId + "/status", Map.class);
    return (String)((Map<String, Object>)taskStatus.get("status")).get("status");
  }

  public String getEngineWorkerHost() {
    Map<String, Object>[] workers = restTemplate.getForObject("http://localhost:8081/druid/indexer/v1/workers", Map[].class);
    Map<String, Object> worker = (Map<String, Object>)workers[0].get("worker");

    return (String)worker.get("host");
  }

  private void waitCurrentThread(int seconds) throws InterruptedException {
    Thread.currentThread().sleep(TimeUnit.SECONDS.toMillis(seconds));
  }

}
