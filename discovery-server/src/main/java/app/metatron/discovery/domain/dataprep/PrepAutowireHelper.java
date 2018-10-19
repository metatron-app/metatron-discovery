package app.metatron.discovery.domain.dataprep;

import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.stereotype.Component;

// https://guylabs.ch/2014/02/22/autowiring-pring-beans-in-hibernate-jpa-entity-listeners/
@Component
public final class PrepAutowireHelper implements ApplicationContextAware {

    private static final PrepAutowireHelper INSTANCE = new PrepAutowireHelper();
    private static ApplicationContext applicationContext;

    private PrepAutowireHelper() {
    }

    public static void autowire(Object classToAutowire, Object... beansToAutowireInClass) {
        for (Object bean : beansToAutowireInClass) {
            if (bean == null) {
                applicationContext.getAutowireCapableBeanFactory().autowireBean(classToAutowire);
                return;
            }
        }
    }

    @Override
    public void setApplicationContext(final ApplicationContext applicationContext) {
        PrepAutowireHelper.applicationContext = applicationContext;
    }

    public static PrepAutowireHelper getInstance() {
        return INSTANCE;
    }

}
