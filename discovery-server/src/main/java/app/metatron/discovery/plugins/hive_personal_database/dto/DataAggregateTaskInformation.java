package app.metatron.discovery.plugins.hive_personal_database.dto;

public class DataAggregateTaskInformation {
  private String name;
  private DataAggregateSource source;
  private DataAggregateTarget target;
  private DataAggregateLoopRange loopRange;

  public DataAggregateTaskInformation() {
  }

  public DataAggregateTaskInformation(DataAggregateSource source, DataAggregateTarget target, DataAggregateLoopRange loopRange) {
    this.source = source;
    this.target = target;
    this.loopRange = loopRange;
  }

  public DataAggregateSource getSource() {
    return source;
  }

  public void setSource(DataAggregateSource source) {
    this.source = source;
  }

  public DataAggregateTarget getTarget() {
    return target;
  }

  public void setTarget(DataAggregateTarget target) {
    this.target = target;
  }

  public DataAggregateLoopRange getLoopRange() {
    return loopRange;
  }

  public void setLoopRange(DataAggregateLoopRange loopRange) {
    this.loopRange = loopRange;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public void validate() {
    this.source.validate();
    this.target.validate();
    this.loopRange.validate();
  }

  @Override
  public String toString() {
    return "DataAggregateTaskInformation{" +
        "name='" + name + '\'' +
        ", source=" + source +
        ", target=" + target +
        ", loopRange=" + loopRange +
        '}';
  }
}
