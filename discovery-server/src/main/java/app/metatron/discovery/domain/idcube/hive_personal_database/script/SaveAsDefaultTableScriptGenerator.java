package app.metatron.discovery.domain.idcube.hive_personal_database.script;


import app.metatron.discovery.domain.idcube.hive_personal_database.dto.SavingHiveTable;

public class SaveAsDefaultTableScriptGenerator extends AbstractSaveAsTableScriptGenerator {

  public SaveAsDefaultTableScriptGenerator(SavingHiveTable savingHiveTable) {
    super(savingHiveTable);
  }

  @Override
  protected String getTableName() {
    return savingHiveTable.getTableName();
  }

  @Override
  protected String additionalScript() {
    return "";
  }

  @Override
  public String rollbackScript() {
    return null;
  }
}
