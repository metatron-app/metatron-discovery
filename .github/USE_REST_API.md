# Restful Metatron API Guide

Metatron supports RESTful API that accepts HTTP requests and responds with JSON data.

## Authorization
First, you need to create a token for the request.
Tokens provide authorization for agents, users and external systems or applications. 

___
You can get a token by this method using your existing account,
#### Request
**URL :** (POST) /oauth/token

**Params (POST data) :**

|key|value|
|---|---|
|grant_type|password|
|client_id|polaris_truster|
|client_secret|secret|
|scope|read write|
|username|_your id_|
|password|_your password_|


#### Response

```JSON
{
    "access_token": "string",
    "token_type": "bearer",
    "refresh_token": "string",
    "expires_in": "long",
    "scope": "string",
    "jti": "string"
}
```

Value of the "access_token" key is what we want to get this time.
This value is "Bearer Token" what will be used for calling REST APIs.

Or you can simply do through CURL :

```CURL
curl {YOUR_BASE_URL}/oauth/token -d grant_type=password -d client_id=polaris_trusted -d client_secret=secret -d scope='read write' -d username={YOUR_ID} -d password={YOUR_PASSWORD}
```

---

## Real World
Now, you can send a HTTP request with Authorization Header.
(The "Bearer" prefix is necessary)

For this task, you can use any REST client like postman.

<img width="1131" alt="Screen Shot 2019-04-22 at 3 25 58 PM" src="https://user-images.githubusercontent.com/42021867/56486685-6c767f80-6513-11e9-8fcd-f26a9716d8ad.png">


Below are pieces of reference about representative APIs and you can check more information on your application into `{YOUR_BASE_URL}/docs/api-guide.html`.

:traffic_light: _Detailed document will be served since 3.2.2 version._

### Datasource

|HTTP Request|Description|
|---|---|
|(GET) /datasources|list all datasources|
|(GET) /datasources/{datasourceId}|Get detail a datasource|
|(POST) /datasources|create a datasource|

### Dashboards

|HTTP Request|Description|
|---|---|
|(GET) /dashboards|list all dashboards|
|(GET) /dashboards/{dashboardId}|Get detail a dashboard|
|(GET) /api/dashboards/{dashboardId}/widgets|list wigets in a dashboard|

### Data Connection

|HTTP Request|Description|
|---|---|
|(GET) /connections|list all connections|
|(GET) /connections/available|get available jdbc types|
|(GET) /connections/{connectionId}/databases|list databases included in data connection|

