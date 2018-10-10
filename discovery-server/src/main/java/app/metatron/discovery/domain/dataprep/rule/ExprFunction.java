package app.metatron.discovery.domain.dataprep.rule;

public class ExprFunction {
    public ExprFunctionCategory category;
    public String name;
    public String description;
    public String example;
    public String exampleResult;

    public ExprFunction(ExprFunctionCategory category, String name, String description, String example, String exampleResult) {
        this.category = category;
        this.name = name;
        this.description = description;
        this.example = example;
        this.exampleResult = exampleResult;
    }
}
