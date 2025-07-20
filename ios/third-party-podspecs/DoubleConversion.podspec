Pod::Spec.new do |s|
  s.name     = "DoubleConversion"
  s.version  = "1.1.6"
  s.summary  = "DoubleConversion from React Native"
  s.homepage = "https://github.com/google/double-conversion"
  s.license  = { :type => "BSD" }
  s.authors  = "Google Inc."
  s.source   = { :git => '', :tag => '' }
  s.source_files = "**/*.{h,cc,cpp}"
  s.header_mappings_dir = "."
  s.requires_arc = true
end
