#!/bin/bash

URLS_FILE=/usr/share/nginx/html/urls.json
TMP_URLS_FILE=/app/tmp.json

if [ -n "${API_HOST}" ]; then
    jq ".API_HOST=\"${API_HOST}\"" ${URLS_FILE} > ${TMP_URLS_FILE}
    cat ${TMP_URLS_FILE} > ${URLS_FILE}
fi

if [ -n "${AUTH_HOST}" ]; then
    jq ".AUTH_HOST=\"${AUTH_HOST}\"" ${URLS_FILE} > ${TMP_URLS_FILE}
    cat ${TMP_URLS_FILE} > ${URLS_FILE}
fi 

if [ -n "${SSE_HOST}" ]; then
    jq ".SSE_HOST=\"${SSE_HOST}\"" ${URLS_FILE} > ${TMP_URLS_FILE}
    cat ${TMP_URLS_FILE} > ${URLS_FILE}
fi

if [ -z "${MONOGRAPH_HOST}" ]; then
    jq ".MONOGRAPH_HOST=\"${MONOGRAPH_HOST}\"" ${URLS_FILE} > ${TMP_URLS_FILE}
    cat ${TMP_URLS_FILE} > ${URLS_FILE}
fi 

nginx -g "daemon off;"