# Тесты на Mocha

## ⚠️ Work in progress ⚠️

Репозиторий с тестами на данный момент в полурабочем состоянии. Большая часть тестов работоспособна при наличии достаточно полной и корректной конфигурации domain config, чего на staging сейчас **нет**. Наборы тестов рассчитаны на эфемерную среду, и (концептуально) конфигурация domain config − это их ответственность. Однако staging сейчас − это не эфемерная среда, и это надо учитывать.

Наборы тестов:

* ❌ `claims.spec.ts`

    Требует адаптации к API отдельного сервиса, который пришёл на смену claim management в capi-v2. Сам [API и кодогенерация](Makefile#L74-L75) завезена, и существующие actions к нему уже адаптированы.

* ✴️ `hooks/receive-hook.spec.ts`

    Использует неактуальный webhook receiver для полного цикла. Вообще нужно бы найти какую-то замену, на первый взгляд достаточно минимальной обёртки вокруг key-value storage, которая будет представлять собой абстракцию _очередь из полученных HTTP-запросов_.

* ✅ `invoice-management.spec.ts`

* ✅ `invoice-template-management.spec.ts`

* ✅ `parties.spec.ts`

* ❌ `payments/crypto.spec.ts`

    Кажется он никогда не работал. Есть ощущение, что вместе с `qiwi.spec.ts` надо засунуть в набор тестов, которые проверяют корректную обработку различных платёжных методов.

* ✅ `payments/direct-recurrent.spec.ts`

* ✴️ `payments/hold-payment.spec.ts`

    Валится один тесткейс из-за неполной конфигурации в domain config: платёж не успевает автоматически перейти в статус captured, потому что в конфиге слишком большой hold lifetime.

* ✴️ `payments/instant-payment.spec.ts`

    Валятся часть тесткейсов из-за неполной конфигурации в domain config.

* ✴️ `payments/payment-resource.spec.ts`

    Валится один тесткейс из-за неполной конфигурации в domain config.

* ❌ `payments/qiwi.spec.ts`

    Тесткейсы валятся из-за неполной конфигурации в domain config.

* ✅ `payments/refund.spec.ts`

* ❌ `payouts.spec.ts`

    Требует адаптации к актуальным API.

* ✅ `short-urls.spec.ts`

* ✅ `transaction.spec.ts`

* ❌ `wallet-payout.spec.ts`

    Требует адаптации к актуальным API (?).

* ✅ `wallets/identities.spec.ts`

* ✴️ `wallets/providers.spec.ts`

    Тесткейсы валятся из-за неполной конфигурации в domain config.

* ✅ `wallets/wallets.spec.ts`

* ✴️ `wallets/withdrawal.spec.ts`

    Большая часть тесткейсов валится из-за неполной конфигурации в domain config.

## Запуск

Весь набор тестов:
```
make test
```

Отдельные тестсьюты:
```
make compile
source .env
node ./mocha-tests.js --verbose --file=build/test/invoice-management.spec.js
```

## Локальная разработка

### Установка зависимостей и генерация swagger клиента

1. Установка зависимостей: `npm i`
1. Генерация swagger typescript: `make gen`

### Вариант 1. Запуск использованием командной строки

Компиляция typescript после изменений в коде тестов: `make compile`

Запуск тестов: `node mocha-tests.js [options]`

`-h --help` - описание параметров запуска.

Пример:
```
node ./mocha-tests.js --verbose --file=build/test/invoice-management.spec.js \
    --auth-endpoint http://auth.empayre.test \
    --external-login demo-merchant \
    --external-password test \
    --api-endpoint http://api.empayre.test \
    --admin-endpoint http://iddqd.empayre.test
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
* `--auth-warn <ms>`
* `--create-invoice-warn <ms>`
* `--create-payment-resource-warn <ms>`
* `--create-payment-warn <ms>`
* `--polling-warn <ms>`
* `--fulfill-invoice-warn <ms>`

Пример:

```
node mocha-tests.js --tt \
    --create-invoice-warn 200 \
    --create-payment-resource-warn 200 \
    --create-payment-warn 200 \
    --polling-warn 5000 \
    --fullfill-invoice-warn 100 \
    --auth-endpoint https://auth.stage.empayre.com \
    --external-login demo-merchant \
    --external-password test \
    --api-endpoint https://api.stage.empayre.com \
    --admin-endpoint https://iddqd.stage.empayre.com \
    --proxy-endpoint https://wrapper.stage.empayre.com \
    --url-shortener-endpoint https://shrt.stage.empayre.com \
    --test-webhook-receiver-endpoint https://test-webhook-receiver.stage.empayre.com
```
