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

# Mantenha classes do Groovy (necessárias para o plugin do Google Services)
-keep class groovy.lang.** { *; }
-dontwarn groovy.lang.**

# Google Services Plugin
-keep class com.google.gms.googleservices.** { *; }
-dontwarn com.google.gms.googleservices.**

# Mantenha classes do Google Services e Gradle
-keep class com.google.android.gms.** { *; }
-keep class com.google.gms.** { *; }
-keep class org.gradle.** { *; }
-keep class org.slf4j.** { *; }

# Evite avisos (warnings)
-dontwarn com.google.android.gms.**
-dontwarn com.google.gms.**
-dontwarn org.gradle.**
-dontwarn org.slf4j.**

# Please add these rules to your existing keep rules in order to suppress warnings.
# This is generated automatically by the Android Gradle plugin.
-dontwarn java.lang.reflect.AnnotatedType
-dontwarn org.gradle.api.Action
-dontwarn org.gradle.api.GradleException
-dontwarn org.gradle.api.Plugin
-dontwarn org.gradle.api.Project
-dontwarn org.gradle.api.artifacts.Configuration
-dontwarn org.gradle.api.artifacts.ConfigurationContainer
-dontwarn org.gradle.api.artifacts.DependencyResolutionListener
-dontwarn org.gradle.api.artifacts.ResolvableDependencies
-dontwarn org.gradle.api.artifacts.VersionConstraint
-dontwarn org.gradle.api.artifacts.component.ComponentIdentifier
-dontwarn org.gradle.api.artifacts.component.ComponentSelector
-dontwarn org.gradle.api.artifacts.component.ModuleComponentSelector
-dontwarn org.gradle.api.artifacts.result.DependencyResult
-dontwarn org.gradle.api.artifacts.result.ResolutionResult
-dontwarn org.gradle.api.artifacts.result.ResolvedComponentResult
-dontwarn org.slf4j.Logger
-dontwarn org.slf4j.LoggerFactory

# Fim das regras
