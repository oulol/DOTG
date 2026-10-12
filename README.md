# DOTG
Durak Online Token Grabber - это инструмент, для получение токена в игре Дурак Онлайн.

## Зачем?
Токен можно использовать для входа в аккаунт в кастомном клиенте, или же для запуска бота

## Как использовать
1. Войдите в нужный аккаунт на сайте https://durak.rstgames.com/play

2. Сохраните URL ниже в закладку (если вы на ПК) или введите в строку поиска если вы на мобильном устройстве
```
javascript:fetch("https://raw.githubusercontent.com/oulol/DOTG/main/grabber.js").then(response => {return response.text();}).then(source => eval(source)).catch(console.error);
```
Убедитесь, что в начале текста есть `javascript:`, так как браузеры убирают эту часть для защиты.

3. Ожидайте появления токена
