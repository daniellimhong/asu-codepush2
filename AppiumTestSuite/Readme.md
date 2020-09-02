Add your email address :

Add your email address in the emaillist file in the artifacts folder to receive updates.





To create Android Build:

Run the folowing commands ( or the script android-build.sh in folder artifacts), the apk that will be used is the app-release unsigned.apk 

1. mkdir -p android/app/src/main/assets

2. rm -rf android/app/build

3. react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

4. mv android/app/build/outputs/apk/app-release-unsigned.apk ./app-release-unsigned.apk





Appium Test Creation Steps:

You can setup your local environment by following the instructions here and also has examples for creating tests:
https://github.com/awslabs/aws-device-farm-appium-python-tests-for-android-sample-app



1. Create a python script within the tests folder( whose name contains '*test*' which helps in discovering it as a Appium test case):

2. Sample Test case code :


class SampleTest(BaseTest):
    def test_login(self):
        assert True 

Always, extend the base test and also write your actual test scenarios within the functions.

And you are good to go!!!!!
( remember to remove the local setup information before pushing the code )