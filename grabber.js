if (window.DOTG_RUNNING) {
    throw new Error("DOTG уже запущен");
}

// Перезаписываем alert чтобы не мешалась ошибка при закрытии дурака
var originalAlert = window.alert;

window.alert = function() {}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

window.DOTG_RUNNING = true;

(async () => {
    
    // Создаём div для вывода текста типо консоль
    var outputDiv = document.createElement('div');
    outputDiv.style.position = "absolute";
    outputDiv.style.top = "0px";
    outputDiv.style.left = "0px";
    outputDiv.style.width = "100%";
    outputDiv.style.height = "100%";
    outputDiv.style.overflowY = "auto";
    outputDiv.style.overflowX = "hidden";
    outputDiv.style.backgroundColor = "black";
    outputDiv.style.color = "white";
    outputDiv.style.fontSize = "14px";
    outputDiv.style.fontFamily = "monospace";
    outputDiv.style.whiteSpace = "pre";
    outputDiv.style.textAlign = "left";

    var spinner = document.createElement("span");
    spinner.style.color = "#aaa";
    var states = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
    var index = 0;
    setInterval(() => {
        index = (index + 1) % states.length;
        spinner.textContent = states[index] + " Получение токена...";
    }, 100);

    document.body.appendChild(outputDiv);
    outputDiv.appendChild(spinner);

    // Вывод в div
    function print(text) {
        outputDiv.insertBefore(document.createTextNode(text + "\n"), spinner);
        outputDiv.scrollTop = outputDiv.scrollHeight;

        console.log("[DOTG] " + text);
    }

    function printCopyable(name, data) {
        outputDiv.insertBefore(document.createTextNode(name + ": " + data), spinner);
        var button = document.createElement("button");
        button.textContent = "Копировать";
        button.style.marginLeft = "10px";
        button.onclick = function() {
            navigator.clipboard.writeText(data);
        }
        outputDiv.insertBefore(button, spinner);
        outputDiv.insertBefore(document.createElement("br"), spinner);
        
        outputDiv.scrollTop = outputDiv.scrollHeight;

        console.log("[DOTG] " + name + ": " + data);
    }

    // Логотип
    print("    ____  ____  ____________");
    print("   / __ \\/ __ \\/_  __/ ____/");
    print("  / / / / / / / / / / / __  ");
    print(" / /_/ / /_/ / / / / /_/ /  ");
    print("/_____/\\____/ /_/  \\____/   ");
    print("");
    print("Durak Online Token Grabber");
    print("By oulol");
    print("https://github.com/oulol/DOTG");
    print("");
    print("DOTG запущен");
    
    var launched = window.unityInstance != undefined;
    if (launched) {
        print("Игра запущена");
        print("Крашаем текущий экземпляр игры...");
        window.unityInstance.Module.abort(); // Заставляет игру крашнутся
        await sleep(1000);
        print("Игра должна была крашнуться");
    } else {
        print("Игра не запущена");
    }
    
    print("");
    print("Изменяем объект WebSocket для перехвата токена");
    const originalWebSocket = WebSocket;

    var id = "0";
    var plr = "";
    var token = "";

    WebSocket = new Proxy(originalWebSocket, {
        construct(target, args) {
            const ws = new target(...args);
            print("");
            print("WebSocket создан (URL: " + args[0] + ")");

            // Перехват входящих сообщений
            ws.addEventListener("message", (event) => {
                let data = event.data;

                if (data == "confirmed") {
                    print("Начало авторизации");
                } else if (data.startsWith("authorized")) {
                    print("Авторизация успешна");
                    id = data.slice(16, -1);
                } else if (data.startsWith("uu{\"k\":\"name\"")) {
                    plr = data.slice(19, -2);
                    
                    spinner.style.display = "none";
                    print("");
                    print("-----РЕЗУЛЬТАТ-----");
                    printCopyable("ID", id);
                    printCopyable("Имя", plr);
                    printCopyable("Токен", token);
                    print("-------------------");
                }
            });

            // Перехват исходящих сообщений
            ws.send = new Proxy(ws.send, {
                apply(target, thisArg, argumentsList) {
                    let data = argumentsList[0];
                    if (data.startsWith("auth")) {
                        token = data.slice(14, -2);
                        print("Получен токен");
                    }

                    return Reflect.apply(target, thisArg, argumentsList);
                }
            });

            return ws;
        }
    });

    print("Перехват пакетов настроен");
    if (launched) {
        print("");
        print("Запуск нового экземпляра игры");

        createUnityInstance(canvas, config, (progress) => {
            print("Загрузка игры: " + (progress * 100).toFixed(0) + "%");
        }).then((unityInstance) => {
            window.unityInstance = unityInstance;
        }).catch((message) => {
            alert(message);
        });
    }
})();
