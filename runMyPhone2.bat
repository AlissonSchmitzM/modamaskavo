@echo off
echo Configurando para dispositivo físico RQ8N9036RAB...
adb -s RQ8N9036RAB reverse tcp:8081 tcp:8081
set ANDROID_SERIAL=RQ8N9036RAB
npx react-native run-android