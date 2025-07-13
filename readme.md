# SSH

Командой ssh-add -l проверять добавленные ключи.

# Установка десктопных приложений (особенно AppImage)

1. Сделать файл исполняемым
2. Убедиться, что есть png иконка приложения
3. Запустить приложение пробно напрямую
4. Запустить команду `xprop | grep WM_CLASS` и тыкнуть курсором по окну приложения. Скопировать второй полученный аргумент. Формат: WM_CLASS(STRING) = "AppName", "AppName"
5. Создать файл ~/.local/share/applications/{appname}.desktop с содержимым
```
[Desktop Entry]
Name={Название приложения}
Exec=/home/{user}/Applications/{appname}.AppImage
Icon=/home/{user}/Applications/{appname}.png
Type=Application
Categories=Utility;
StartupWMClass={Ранее скопированный аргумент}
StartupNotify=true
Terminal=false
```
6. Обновить кеш `update-desktop-database ~/.local/share/applications`