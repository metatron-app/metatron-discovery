import {Injectable, Injector} from '@angular/core';
import {EngineServiceModule} from './engine-service.module';
import {AbstractService} from '../../common/service/abstract.service';
import {Engine} from '../../domain/engine-monitoring/engine';
import * as _ from 'lodash';
import {PageResult} from '../../domain/common/page';
import {Criteria} from "../../domain/datasource/criteria";

@Injectable({
  providedIn: EngineServiceModule
})
export class EngineService extends AbstractService {

  private readonly URL_MONITORING = this.API_URL + 'monitoring';

  constructor(protected injector: Injector) {
    super(injector);
  }

  /**
   * Get full server list (including status)
   */
  public getMonitorings(monitoring: Engine.Monitoring,
                        page: PageResult,
                        projection: 'default' | 'forDetailView' | 'forServerHealth' = 'default'): Promise<Engine.Result.Monitoring> {

    let url = `${this.URL_MONITORING}?projection=${projection}`;

    if (_.negate((_.isNil))(monitoring.type)) {
      url += `&type=${monitoring.type}`;
    }

    if (_.negate((_.isNil))(monitoring.port)) {
      url += `&port=${monitoring.port}`;
    }

    if (_.negate((_.isNil))(monitoring.hostname)) {
      url += `&hostname=${monitoring.hostname}`;
    }

    if (_.negate((_.isNil))(monitoring.status)) {
      url += `&status=${monitoring.status}`;
    }

    if (_.negate((_.isNil))(page.number)) {
      url += `&number=${page.number}`;
    }

    if (_.negate((_.isNil))(page.size)) {
      url += `&size=${page.size}`;
    }

    return this.get(url);
  }

  /**
   * Get status inquiry by server type
   */
  public getMonitoringServersHealth(): Promise<Engine.Result.Health> {
    return this.get(this.URL_MONITORING + '/servers/health');
  }

  /**
   * Get chart data
   */
  public getMonitoringQuery(params: object) {
    return this.post(this.URL_MONITORING + '/query', params);
  }

  /**
   * Get chart data
   */
  public getMonitoringData(params: object) {
    return this.post(this.URL_MONITORING + '/data', params);
  }

  public getMemory(params?: object) {
    return this.post(this.URL_MONITORING + '/memory', params == undefined ? {} : params);
  }

  public getInformation(name) {
    return this.get(this.URL_MONITORING + '/information/' + name);
  }

  public getDatasourceList() {
    return this.get(this.URL_MONITORING + '/datasource/list');
  }

  public getSegmentCount() {
    return this.get(this.URL_MONITORING + '/segment/count');
  }

  public getSize() {
    return this.get(this.URL_MONITORING + '/size');
  }

  public getRunningTasks() {
    return this.get(this.URL_MONITORING + '/ingestion/tasks/running' );
  }

  public getTaskList() {
    return this.get(this.URL_MONITORING + '/ingestion/tasks/list');
  }

  public getTaskById(taskId) {
    return this.get(this.URL_MONITORING + '/ingestion/task/' + taskId);
  }

  public getTaskLogById(taskId, offset?) {
    return this.get(this.URL_MONITORING + '/ingestion/task/' + taskId + '/log' + (offset ? '?offset='+offset : ''));
  }

  public shutdownTaskById(taskId) {
    return this.post(this.URL_MONITORING + '/ingestion/task/' + taskId + '/shutdown', null);
  }

  public getSupervisorList() {
    return this.get(this.URL_MONITORING + '/ingestion/supervisors/list');
  }

  public getSupervisorStatus(supervisorId) {
    return this.get(this.URL_MONITORING + '/ingestion/supervisor/' + supervisorId);
  }

  public getSupervisorRows(params: object) {
    return this.post(this.URL_MONITORING + '/ingestion/supervisor/row', params);
  }

  public shutdownSupervisorById(supervisorId) {
    return this.post(this.URL_MONITORING + '/ingestion/supervisor/' + supervisorId + '/shutdown', null);
  }

  public resetSupervisorById(supervisorId) {
    return this.post(this.URL_MONITORING + '/ingestion/supervisor/' + supervisorId + '/reset', null);
  }

  public getWorkerList() {
    return this.get(this.URL_MONITORING + '/ingestion/workers/list');
  }

  public getCriterionListInTask() {
    return this.get(this.URL_MONITORING + '/ingestion/tasks/criteria');
  }

  public getCriterionInTask(criterionKey: Criteria.ListCriterionKey) {
    return this.get(this.URL_MONITORING + `/ingestion/tasks/criteria/${criterionKey}`);
  }

  public getCriterionListInWorker() {
    return this.get(this.URL_MONITORING + '/ingestion/workers/criteria');
  }

  public getCriterionInWorker(criterionKey: Criteria.ListCriterionKey) {
    return this.get(this.URL_MONITORING + `/ingestion/workers/criteria/${criterionKey}`);
  }

}
