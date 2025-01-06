## Overview

Notesnook Self Host Web Client

## Env

| Name           | Desc                 | Default                         |
|----------------|----------------------|---------------------------------|
| API_HOST       | sync server url      | https://api.notesnook.com       |
| AUTH_HOST      | identity server url  | https://auth.streetwriters.co   |
| SSE_HOST       | sse server url       | https://events.streetwriters.co |
| MONOGRAPH_HOST | monograph server url | https://monogr.ph               |

## Example 

```yaml
  notesnook-web-client:
    image: dyw770/notesnook-web:latest
    ports:
      - 8080:80
    environment:
      API_HOST: https://ns-sync.xxx.com
      AUTH_HOST: https://ns-auth.xxx.com
      SSE_HOST: https://ns-sse.xxx.com
      MONOGRAPH_HOST: https://ns-ph.xxx.com
```

add the above configuration to docker-compose.yml of notesnook-sync-server