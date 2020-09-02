import boto3
import time
import httplib
import requests
import os

client = boto3.client('devicefarm',region_name='us-west-2')
projectArn='arn:aws:devicefarm:us-west-2:456214169279:project:cf869322-5ffa-4ed5-9fbc-17f638180d6d'

print "######## Creating APK Upload #################"
response = client.create_upload(
    projectArn='arn:aws:devicefarm:us-west-2:456214169279:project:cf869322-5ffa-4ed5-9fbc-17f638180d6d',
    name='app-release-unsigned.apk',
    type='ANDROID_APP',
    contentType='application/octet-stream'
)

print response

print "######## Upload URL Response #############"

uploadUrl = response['upload']['url']
print uploadUrl

print "######### Uploading to S3 ################"

length = str(os.stat('app-release-unsigned.apk').st_size)
headers = {'content-type': 'application/octet-stream','Content-Length' : length}
fileToUpload = {'file': open('app-release-unsigned.apk', 'rb')}
filepath = './artifacts/app-debug.apk'
responseUpload = requests.put(uploadUrl,
                headers = headers,
                data = open('app-release-unsigned.apk', 'rb')              
                 )
print responseUpload

print "########## Finised Uploading ############"
    

apkuploadArn = response['upload']['arn']
print apkuploadArn

time.sleep(50)
response = client.get_upload(
    arn=apkuploadArn
)
print response

print "############### Upload the Appium Project##############"

appiumTestResponse = client.create_upload(
    projectArn='arn:aws:devicefarm:us-west-2:456214169279:project:cf869322-5ffa-4ed5-9fbc-17f638180d6d',
    name='appiumTestSuite',
    type='APPIUM_PYTHON_TEST_PACKAGE',
    contentType='application/octet-stream'
)

print appiumTestResponse

print "######## Upload URL Response #############"

testSuiteUploadUrl = appiumTestResponse['upload']['url']
print testSuiteUploadUrl

print "######### Uploading to S3 ################"

length = str(os.stat('../AppiumTestSuite/test_bundle.zip').st_size)
headers = {'content-type': 'application/octet-stream','Content-Length' : length}
responseUpload = requests.put(testSuiteUploadUrl,
                headers = headers,
                data = open('../AppiumTestSuite/test_bundle.zip', 'rb')              
                 )
print responseUpload

testSuiteuploadArn = appiumTestResponse['upload']['arn']
print testSuiteuploadArn


time.sleep(100)
response = client.get_upload(
    arn=testSuiteuploadArn
)

print response



print "######## starting the DeviceFarm run ################"
devicePoolArn = 'arn:aws:devicefarm:us-west-2:456214169279:devicepool:cf869322-5ffa-4ed5-9fbc-17f638180d6d/00b39489-9b86-4d7e-a380-86369c44a529'
response = client.schedule_run(
    projectArn=projectArn,
    appArn=apkuploadArn,
    devicePoolArn=devicePoolArn,
    name='automation_test',
    test={
        'type': 'APPIUM_PYTHON',
        'testPackageArn': testSuiteuploadArn,
        'parameters': {
            'appium_version': 'default'
        }
    }
)

print response
runArn = response['run']['arn']



#runArn = 'arn:aws:devicefarm:us-west-2:456214169279:run:cf869322-5ffa-4ed5-9fbc-17f638180d6d/5874f897-a590-4eba-b407-2521b5dd8209'
print runArn

time.sleep(50)
response = client.get_run(
    arn=runArn
)
print response

while( response['run']['status'] != 'COMPLETED') :
    time.sleep(50)
    response = client.get_run(
        arn=runArn
        )

print response


output = 'The status of the run : <b style="font-size: 35px;" > ' + response['run']['result'] + ' </b> <br> \
          Test Run Deatils: \
          <table style="width:100%,border: 1px solid black;"> \
          <tr>\
              <th>Total</th> \
              <th>Passed</th> \
              <th>Failed</th> \
              <th>Warned</th> \
              <th>Errored</th> \
              <th>Stopped</th> \
              <th>Skipped</th> \
          </tr> \
          <tr> \
          <td>' + str(response['run']['counters']['total']) + ' </td>\
          <td>' + str(response['run']['counters']['passed']) + ' </td>\
          <td>' + str(response['run']['counters']['failed']) + ' </td>\
          <td>' + str(response['run']['counters']['warned']) + ' </td>\
          <td>' + str(response['run']['counters']['errored']) + ' </td>\
          <td>' + str(response['run']['counters']['stopped']) + ' </td>\
          <td>' + str(response['run']['counters']['skipped']) + ' </td>\
          </tr> </table>'

sesClient = boto3.client('ses')

f = open("emaillist","r")
print "sending out emails"
for line in f:
    emailAddr = line.strip()
    response = sesClient.send_email(Source='prajago9@asu.edu',
    Destination={
        'ToAddresses': [
            emailAddr,
        ],
    },
    Message={
        'Subject': {
            'Data': 'Appium Test Results for ASU Mobile App',
            'Charset': 'UTF-8'
        },
        'Body': {
            'Html': {
                'Charset': 'UTF-8',
                'Data': output
            }
        }
    })

    print response
