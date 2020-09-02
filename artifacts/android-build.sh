#!/bin/bash

mkdir -p android/app/src/main/assets

rm -rf android/app/build

react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

mv android/app/build/outputs/apk/app-release-unsigned.apk ./app-release-unsigned.apk