package app.metatron.discovery.domain.dataprep.rule;

public class ExprFunction {
    public ExprFunctionCategory category;
    public String name;
    public String description;
    public String example;

    public ExprFunction(ExprFunctionCategory category, String name, String description, String example) {
        this.category = category;
        this.name = name;
        this.description = description;
        this.example = example;
    }
}
