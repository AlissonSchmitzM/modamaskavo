const { withDangerousMod } = require('@expo/config-plugins');
const { resolve } = require('path');
const { readFileSync, writeFileSync } = require('fs');

function withFixedCpp(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = resolve(config.modRequest.projectRoot, 'ios', 'Podfile');
      let podfileContents = readFileSync(podfilePath, 'utf8');

      // 1. Configuração básica obrigatória
      if (!podfileContents.includes('platform :ios')) {
        podfileContents = `platform :ios, '13.0'\n${podfileContents}`;
      }

      // 2. Configuração de frameworks estáticos
      if (!podfileContents.includes('use_frameworks! :linkage => :static')) {
        podfileContents = podfileContents.replace(
          /use_frameworks!/,
          'use_frameworks! :linkage => :static'
        );
      }

      // 3. Configuração de modular headers
      if (!podfileContents.includes('use_modular_headers!')) {
        podfileContents = `use_modular_headers!\n${podfileContents}`;
      }

      // 4. Configuração específica para Firebase
      const firebasePods = [
        'Firebase',
        'FirebaseAuth',
        'FirebaseCore',
        'FirebaseDatabase',
        'FirebaseStorage',
        'FirebaseFirestore',
        'GoogleUtilities',
        'RecaptchaInterop'
      ];

      firebasePods.forEach(podName => {
        const regex = new RegExp(`pod\\s+['"]${podName}['"][^\\n]*`);
        if (podfileContents.match(regex)) {
          podfileContents = podfileContents.replace(
            regex,
            match => `${match.trimEnd()}, :modular_headers => true`
          );
        }
      });

      // 5. Configurações de build pós-instalação
      const postInstall = `
post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      # Padrão C++ moderno
      config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++20'
      config.build_settings['CLANG_CXX_LIBRARY'] = 'libc++'
      
      # Flags essenciais
      config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= [
        '$(inherited)',
        '_LIBCPP_DISABLE_AVAILABILITY=1',
        'HAVE_FULLFSYNC=0'
      ]
      
      # Otimizações
      config.build_settings['OTHER_CPLUSPLUSFLAGS'] = ['-stdlib=libc++']
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '13.0'
      config.build_settings['ALWAYS_SEARCH_USER_PATHS'] = 'NO'
      
      # Resolve problemas de header search paths
      config.build_settings['HEADER_SEARCH_PATHS'] = [
        '$(inherited)',
        '"$(PODS_ROOT)/Headers/Public"',
        '"$(PODS_ROOT)/Headers/Public/Firebase"',
        '"$(PODS_ROOT)/Headers/Public/GoogleUtilities"'
      ]
      
      # Configurações para Firebase
      config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FIRFirestore_VERSION=10.0.0'
      config.build_settings['OTHER_LDFLAGS'] = '$(inherited) -ObjC -lc++'
    end
  end
end
`;

      if (!podfileContents.includes('post_install do |installer|')) {
        podfileContents += postInstall;
      }

      writeFileSync(podfilePath, podfileContents);
      return config;
    }
  ]);
}

module.exports = (config) => {
  return withFixedCpp(config);
};