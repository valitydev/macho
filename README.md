# Тесты на Mocha

## Запуск

```
make test
```

## Локальная разработка

### Установка зависимостей и генерация swagger клиента

1. Установка зависимостей: `npm i`
1. Генерация swagger typescript. Необходим swagger codegen версии **2.3.1**:
    - CAPI:
        - v2: `swagger-codegen generate -i ../../schemes/swag/v2/swagger.json -l typescript-fetch -o api/capi-v2/codegen`
    - Url shortener: `swagger-codegen generate -i ../../schemes/swag-url-shortener/v1/swagger.json -l typescript-fetch -o api/url-shortener-v1/codegen`
    - WAPI:
        - payres: `swagger-codegen generate -i ../../schemes/swag-wallets/v0/api/payres/swagger.json -l typescript-fetch -o api/wapi-v0/payres/codegen`
        - privdoc `swagger-codegen generate -i ../../schemes/swag-wallets/v0/api/privdoc/swagger.json -l typescript-fetch -o api/wapi-v0/privdoc/codegen`
        - wallet `swagger-codegen generate -i ../../schemes/swag-wallets/v0/api/wallet/swagger.json -l typescript-fetch -o api/wapi-v0/wallet/codegen`

### Вариант 1. Запуск использованием командной строки

Компиляция typescript после изменений в коде тестов: `./node_modules/.bin/tsc`

Запуск тестов: `node mocha-tests.js [options]`

`-h --help` - описание параметров запуска.

Пример:

```
node mocha-tests.js --auth-endpoint http://auth.rbk.test:8080 --external-login demo_merchant --external-password test --capi-endpoint http://api.rbk.test:8080 --admin-endpoint http://iddqd.rbk.test:8080 --internal-login manager --internal-password manager --url-shortener-endpoint http://short.rbk.test:8080 --proxy-endpoint http://wrapper.rbk.test:8080 --test-webhook-receiver-endpoint http://test-webhook-receiver.rbk.test:8080
```

### Вариант 2. Запуск и отладка с использованием Intellij IDEA, WebStorm

Настройка параметров тестов производится в [.env](.env)

В Run/Debug Configuration, необходимо настроить "Defaults" конфигурацию Mocha:

-   Extra Mocha options: `--require ts-node/register --timeout 25000`
-   Выбрать File patterns, со значением: `test/**/*.spec.ts`
-   Working directory: `<...>/wetkitty/test/mocha`

Далее можно добавлять новую Mocha конфигурацию и запускать / отлаживать тесты

## Тестовая транзакция

### Сборка

`make mocha-tests`

В ходе этого собирается отдельный исполняемый файл пригодный для использования без nodejs на хостах, с которых идут тестовые транзакции на продакшн.

### Запуск

`--tt` - признак проведения тестовой транзакции

Если указан `--tt`, необходимо задать warning тайминги:

`--auth-warn <ms>`

`--create-invoice-warn <ms>`

`--create-payment-resource-warn <ms>`

`--create-payment-warn <ms>`

`--polling-warn <ms>`

`--fulfill-invoice-warn <ms>`

Пример:

```
node mocha-tests.js --tt --create-invoice-warn 200 --create-payment-resource-warn 200 --create-payment-warn 200 --polling-warn 5000 --fullfill-invoice-warn 100 --auth-endpoint http://auth.rbk.test:8080 --external-login demo_merchant --external-password test --capi-endpoint http://api.rbk.test:8080 --internal-login manager --internal-password manager --admin-endpoint http://iddqd.rbk.test:8080 --proxy-endpoint http://wrapper.rbk.test:8080 --url-shortener-endpoint http://short.rbk.test:8080 --test-webhook-receiver-endpoint http://test-webhook-receiver.rbk.test:8080
```
