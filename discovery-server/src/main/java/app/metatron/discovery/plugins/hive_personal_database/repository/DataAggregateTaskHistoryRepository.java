package app.metatron.discovery.plugins.hive_personal_database.repository;

import app.metatron.discovery.plugins.hive_personal_database.entity.DataAggregateTaskHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DataAggregateTaskHistoryRepository extends JpaRepository<DataAggregateTaskHistory, Long> {
  List<DataAggregateTaskHistory> findByTaskIdOrderByIdDesc(Long taskId);
}
