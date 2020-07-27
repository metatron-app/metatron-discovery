package app.metatron.discovery.common.cache;

import org.infinispan.notifications.Listener;
import org.infinispan.notifications.cachelistener.annotation.CacheEntriesEvicted;
import org.infinispan.notifications.cachelistener.annotation.CacheEntryActivated;
import org.infinispan.notifications.cachelistener.annotation.CacheEntryCreated;
import org.infinispan.notifications.cachelistener.annotation.CacheEntryExpired;
import org.infinispan.notifications.cachelistener.annotation.CacheEntryLoaded;
import org.infinispan.notifications.cachelistener.annotation.CacheEntryPassivated;
import org.infinispan.notifications.cachelistener.annotation.CacheEntryVisited;
import org.infinispan.notifications.cachelistener.event.CacheEntriesEvictedEvent;
import org.infinispan.notifications.cachelistener.event.CacheEntryActivatedEvent;
import org.infinispan.notifications.cachelistener.event.CacheEntryCreatedEvent;
import org.infinispan.notifications.cachelistener.event.CacheEntryEvent;
import org.infinispan.notifications.cachelistener.event.CacheEntryExpiredEvent;
import org.infinispan.notifications.cachelistener.event.CacheEntryLoadedEvent;
import org.infinispan.notifications.cachelistener.event.CacheEntryPassivatedEvent;
import org.infinispan.notifications.cachelistener.event.CacheEntryVisitedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Listener
public class CacheListener {

  private static Logger LOGGER = LoggerFactory.getLogger(CacheListener.class);

  @CacheEntryCreated
  public void entryCreated(CacheEntryCreatedEvent<String, String> event) {
    this.printLog("Adding key '" + event.getKey()
                      + "' to cache", event);
  }

  @CacheEntryExpired
  public void entryExpired(CacheEntryExpiredEvent<String, String> event) {
    this.printLog("Expiring key '" + event.getKey()
                      + "' from cache", event);
  }

  @CacheEntryVisited
  public void entryVisited(CacheEntryVisitedEvent<String, String> event) {
    this.printLog("Key '" + event.getKey() + "' was visited", event);
  }

  @CacheEntryActivated
  public void entryActivated(CacheEntryActivatedEvent<String, String> event) {
    this.printLog("Activating key '" + event.getKey()
                      + "' on cache", event);
  }

  @CacheEntryPassivated
  public void entryPassivated(CacheEntryPassivatedEvent<String, String> event) {
    this.printLog("Passivating key '" + event.getKey()
                      + "' from cache", event);
  }

  @CacheEntryLoaded
  public void entryLoaded(CacheEntryLoadedEvent<String, String> event) {
    this.printLog("Loading key '" + event.getKey()
                      + "' to cache", event);
  }

  @CacheEntriesEvicted
  public void entriesEvicted(CacheEntriesEvictedEvent<String, String> event) {
    StringBuilder builder = new StringBuilder();
    event.getEntries().forEach(
        (key, value) -> builder.append(key).append(", "));
    LOGGER.debug("Evicting following entries from cache: "
                           + builder.toString());
  }

  private void printLog(String log, CacheEntryEvent event) {
    if (!event.isPre()) {
      LOGGER.debug(log);
    }
  }
}