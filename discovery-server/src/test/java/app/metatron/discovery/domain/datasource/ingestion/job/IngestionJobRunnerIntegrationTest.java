package app.metatron.discovery.domain.datasource.ingestion.job;

import app.metatron.discovery.AbstractIntegrationTest;
import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.fixture.MySqlDatasourceTestFixture;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.test.context.jdbc.Sql;

import javax.persistence.EntityManager;
import java.io.IOException;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;


public class IngestionJobRunnerIntegrationTest extends AbstractIntegrationTest {

  @Autowired
  IngestionJobRunner jobRunner;

  @Autowired
  EntityManager entityManager;

  @Test
  @Sql({"/sql/test_datasource_list.sql"})
  public void test_ingestion_when_type_batch_and_range_INCREMENTAL() throws IOException {
    // given
    MySqlDatasourceTestFixture.setUpPaymentFixture();

    SimpMessagingTemplate mockSimpMessagingTemplate = mock(SimpMessagingTemplate.class);
    jobRunner.setMessagingTemplate(mockSimpMessagingTemplate);

    DataSource dataSource = entityManager.find(DataSource.class, "ds-test-05");

    // when
    jobRunner.ingestion(dataSource);

    // then
    ArgumentCaptor<String> destination = ArgumentCaptor.forClass(String.class);
    ArgumentCaptor<Object> payload = ArgumentCaptor.forClass(Object.class);

    verify(mockSimpMessagingTemplate, atLeastOnce()).convertAndSend(destination.capture(), payload.capture());

    System.out.println(payload.getAllValues());

    ObjectMapper mapper = new ObjectMapper();
    List<Map<String, Object>> result = mapper.readValue(payload.getAllValues().toString(), new TypeReference<List<Map<String, Object>>>(){});

    boolean endOfIngestionJob = result.stream().anyMatch(payloadValue ->
        payloadValue.get("message").equals("END_INGESTION_JOB")
            && ((Integer) payloadValue.get("progress")) == 100);

    assertThat(endOfIngestionJob).isTrue();
  }

}