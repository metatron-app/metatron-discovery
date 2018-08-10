
library(jsonlite)

data(iris)

fit <- lm(Petal.Width ~ Petal.Length, data=iris)

summary(fit)

plot(fit)

toJSON(list(status = "SUCCESS", code = "200", output = list(studentid = "1001", name = "Kevin")), pretty = T)
