# React Native
-keep class com.facebook.react.** { *; }
-keep class !com.facebook.react.views.art.**, !com.facebook.react.views.clipboard.**, !com.facebook.react.views.modal.**, !com.facebook.react.views.picker.**, !com.facebook.react.views.progressbar.**, !com.facebook.react.views.scroll.**, !com.facebook.react.views.slider.**, !com.facebook.react.views.swiperefresh.**, !com.facebook.react.views.switch.**, !com.facebook.react.views.text.**, !com.facebook.react.views.textinput.**, !com.facebook.react.views.toolbar.**, !com.facebook.react.views.webview.** { *; }
-keep class com.facebook.react.bridge.** { *; }
-keep class com.facebook.jni.** { *; }

# react-native-toast-message
-keep class com.facebook.react.bridge.WritableNativeMap { *; }
-keep class com.facebook.react.bridge.WritableNativeArray { *; }
-keep class com.swmansion.gesturehandler.react.** { *; } # Se você usa react-native-gesture-handler
-keep class com.airbnb.android.react.lottie.** { *; } # Se você usa Lottie
-keep class com.reactnativecommunity.asyncstorage.** { *; } # Se você usa AsyncStorage

# Adicione regras específicas para react-native-toast-message se as genéricas não funcionarem
# (Geralmente as regras do React Native acima são suficientes, mas por segurança)
-keep class com.facebook.react.uimanager.ViewGroupManager { *; }
-keep class com.facebook.react.uimanager.ViewManager { *; }
-keep public class com.facebook.react.ReactPackage { *; }
-keep public class * implements com.facebook.react.ReactPackage { *; }

# Mantenha as classes específicas do Toast (ajuste o pacote se for diferente na sua versão)
# Tente primeiro sem esta regra específica, adicione se necessário.
# -keep class com.reactnativetoastmessage.** { *; }

# Mantenha outras bibliotecas que você usa e que possam ter partes nativas
# Exemplo: react-native-firebase
-keep class io.invertase.firebase.** { *; }
-keep class com.google.firebase.** { *; }

# Mantenha classes do Asaas SDK se houver parte nativa (verificar documentação deles)
# -keep class com.asaas.** { *; }

# Fim das regras
