package app.metatron.discovery.domain.tag;

/**
 *
 */
public class TagCountDTO {

  String id;
  String name;
  Long count;

  public TagCountDTO(String id, String name){
    this.id = id;
    this.name = name;
    this.count = 0L;
  }

  public TagCountDTO(String id, Integer count){
    this.id = id;
    this.count = Long.valueOf(count);
  }

  public TagCountDTO(String id, Long count){
    this.id = id;
    this.count = count;
  }

  public TagCountDTO(String id, String name, Integer count){
    this.id = id;
    this.name = name;
    this.count = Long.valueOf(count);
  }

  public TagCountDTO(String id, String name, Long count){
    this.id = id;
    this.name = name;
    this.count = count;
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public Long getCount() {
    return count;
  }

  public void setCount(Long count) {
    this.count = count;
  }

  @Override
  public String toString() {
    return "TagCountDTO{" +
        "id='" + id + '\'' +
        ", name='" + name + '\'' +
        ", count=" + count +
        '}';
  }
}
