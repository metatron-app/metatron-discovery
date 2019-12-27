package app.metatron.discovery.plugins.hive_personal_database.repository;

import app.metatron.discovery.plugins.hive_personal_database.entity.DataAggregateTask;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DataAggregateTaskRepository extends JpaRepository<DataAggregateTask, Long> {
  Page<DataAggregateTask> findByWorkbenchIdOrderByIdDesc(String workbenchId, Pageable pageable);
}
