@echo off
echo Configurando para dispositivo físico RXCX90AKG3L...
adb -s RXCX90AKG3L reverse tcp:8081 tcp:8081
set ANDROID_SERIAL=RXCX90AKG3L
npx react-native run-android