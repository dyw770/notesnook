FROM nginx:1.27.3

ENV API_HOST="https://api.notesnook.com" \
    AUTH_HOST="https://auth.streetwriters.co" \
    SSE_HOST="https://events.streetwriters.co" \
    ISSUES_HOST="https://issues.streetwriters.co" \
    MONOGRAPH_HOST="https://monogr.ph" \
    SUBSCRIPTIONS_HOST="https://subscriptions.streetwriters.co"

WORKDIR /app

RUN apt-get update \
    && apt-get install -y jq 

COPY build /usr/share/nginx/html
COPY docker-entrypoint.sh /app/docker-entrypoint.sh

ENTRYPOINT ["/bin/bash", "docker-entrypoint.sh"]