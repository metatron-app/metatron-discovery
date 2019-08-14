package app.metatron.discovery.domain.workbench.hive.scriptgenerator;

import app.metatron.discovery.domain.workbench.hive.SavingHiveTable;

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
