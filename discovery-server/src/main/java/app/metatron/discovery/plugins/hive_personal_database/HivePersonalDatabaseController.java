package app.metatron.discovery.plugins.hive_personal_database;

import app.metatron.discovery.common.exception.BadRequestException;
import app.metatron.discovery.common.exception.ResourceNotFoundException;
import app.metatron.discovery.domain.dataconnection.DataConnection;
import app.metatron.discovery.domain.dataconnection.DataConnectionHelper;
import app.metatron.discovery.domain.dataconnection.accessor.HiveDataAccessor;
import app.metatron.discovery.domain.dataconnection.dialect.HiveDialect;
import app.metatron.discovery.domain.workbench.Workbench;
import app.metatron.discovery.domain.workbench.WorkbenchRepository;
import app.metatron.discovery.extension.dataconnection.jdbc.accessor.JdbcAccessor;
import app.metatron.discovery.plugins.hive_personal_database.dto.CreateTableInformation;
import app.metatron.discovery.util.HibernateUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
public class HivePersonalDatabaseController {

  private WorkbenchRepository workbenchRepository;

  private HivePersonalDatabaseService hivePersonalDatabaseService;

  @Autowired
  public void setWorkbenchRepository(WorkbenchRepository workbenchRepository) {
    this.workbenchRepository = workbenchRepository;
  }

  @Autowired
  public void setHivePersonalDatabaseService(HivePersonalDatabaseService hivePersonalDatabaseService) {
    this.hivePersonalDatabaseService = hivePersonalDatabaseService;
  }

  @RequestMapping(value = "/api/plugins/hive-personal-database/workbenches/{id}/table", method = RequestMethod.POST)
  @ResponseBody
  public ResponseEntity<?> createTable(@PathVariable("id") String id,
                                       @RequestBody CreateTableInformation createTableInformation) {
    Workbench workbench = workbenchRepository.findOne(id);

    if(workbench == null) {
      throw new ResourceNotFoundException("Workbench(" + id + ")");
    }

    DataConnection dataConnection = HibernateUtils.unproxy(workbench.getDataConnection());

    JdbcAccessor jdbcDataAccessor = DataConnectionHelper.getAccessor(dataConnection);

    if((jdbcDataAccessor instanceof HiveDataAccessor) == false ||
        HiveDialect.isSupportSaveAsHiveTable(dataConnection) == false) {
      throw new BadRequestException("Only Hive Connection supported save as hive table is allowed.");
    }

    hivePersonalDatabaseService.createTable(dataConnection, createTableInformation);

    return ResponseEntity.noContent().build();
  }
}
